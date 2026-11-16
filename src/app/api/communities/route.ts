import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  communities,
  communityMembers,
  communityPosts,
  communityComments,
  profiles,
} from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { getCurrentUser, requireUser, AuthError, logAudit } from "@/lib/auth";
import { communityCreateSchema } from "@/lib/validation";
import { generateSlug, checkRateLimit } from "@/lib/security";
import { ensureSeeded } from "@/db/seed";

export async function GET(req: Request) {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    if (communityId) {
      const posts = await db
        .select({
          id: communityPosts.id,
          content: communityPosts.content,
          createdAt: communityPosts.createdAt,
          authorId: communityPosts.authorId,
          authorName: profiles.username,
          authorBadge: profiles.verificationBadge,
        })
        .from(communityPosts)
        .innerJoin(profiles, eq(communityPosts.authorId, profiles.id))
        .where(and(eq(communityPosts.communityId, communityId), eq(communityPosts.status, "active")))
        .orderBy(desc(communityPosts.createdAt))
        .limit(40);

      const postIds = posts.map((p) => p.id);
      const allComments = postIds.length
        ? await db
            .select({
              id: communityComments.id,
              postId: communityComments.postId,
              content: communityComments.content,
              createdAt: communityComments.createdAt,
              authorName: profiles.username,
              authorBadge: profiles.verificationBadge,
            })
            .from(communityComments)
            .innerJoin(profiles, eq(communityComments.authorId, profiles.id))
            .where(eq(communityComments.status, "active"))
            .orderBy(desc(communityComments.createdAt))
            .limit(120)
        : [];

      const commentsByPost = new Map<string, typeof allComments>();
      for (const c of allComments) {
        if (!postIds.includes(c.postId)) continue;
        const arr = commentsByPost.get(c.postId) || [];
        arr.push(c);
        commentsByPost.set(c.postId, arr);
      }

      return NextResponse.json({
        posts: posts.map((p) => ({ ...p, comments: commentsByPost.get(p.id) || [] })),
      });
    }

    const list = await db
      .select({
        id: communities.id,
        slug: communities.slug,
        name: communities.name,
        description: communities.description,
        rules: communities.rules,
        category: communities.category,
        privacy: communities.privacy,
        status: communities.status,
        createdAt: communities.createdAt,
        creatorName: profiles.username,
      })
      .from(communities)
      .innerJoin(profiles, eq(communities.creatorId, profiles.id))
      .where(eq(communities.status, "active"))
      .orderBy(desc(communities.createdAt))
      .limit(40);

    const memberCounts = await db
      .select({ communityId: communityMembers.communityId, total: count() })
      .from(communityMembers)
      .where(eq(communityMembers.status, "active"))
      .groupBy(communityMembers.communityId);

    const countMap = new Map(memberCounts.map((m) => [m.communityId, Number(m.total)]));
    let joinedSet = new Set<string>();
    if (user) {
      const memberships = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(and(eq(communityMembers.userId, user.id), eq(communityMembers.status, "active")));
      joinedSet = new Set(memberships.map((m) => m.communityId));
    }

    return NextResponse.json({
      communities: list.map((c) => ({
        ...c,
        membersCount: countMap.get(c.id) || 0,
        isMember: joinedSet.has(c.id),
      })),
    });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل المجتمعات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const action = body?.action || "create_community";

    if (action === "join" && typeof body?.communityId === "string") {
      await db
        .insert(communityMembers)
        .values({ communityId: body.communityId, userId: user.id, role: "member" })
        .onConflictDoNothing();
      return NextResponse.json({ ok: true });
    }

    if (action === "leave" && typeof body?.communityId === "string") {
      await db
        .delete(communityMembers)
        .where(
          and(eq(communityMembers.communityId, body.communityId), eq(communityMembers.userId, user.id))
        );
      return NextResponse.json({ ok: true });
    }

    if (action === "post" && typeof body?.communityId === "string") {
      const rl = await checkRateLimit(`comm-post:${user.id}`, 10, 15 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json({ error: "يرجى الانتظار قليلاً قبل نشر مشاركة جديدة" }, { status: 429 });
      }
      const content = typeof body?.content === "string" ? body.content.trim() : "";
      if (content.length < 4 || content.length > 1500) {
        return NextResponse.json({ error: "يجب أن يكون النص بين 4 و 1500 حرف" }, { status: 400 });
      }
      const [created] = await db
        .insert(communityPosts)
        .values({ communityId: body.communityId, authorId: user.id, content })
        .returning();
      return NextResponse.json({ post: created }, { status: 201 });
    }

    if (action === "comment" && typeof body?.postId === "string") {
      const rl = await checkRateLimit(`comm-comment:${user.id}`, 20, 15 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json({ error: "تم تجاوز معدل التعليقات المؤقت" }, { status: 429 });
      }
      const content = typeof body?.content === "string" ? body.content.trim() : "";
      if (content.length < 2 || content.length > 600) {
        return NextResponse.json({ error: "يجب أن يكون التعليق بين حرفين و 600 حرف" }, { status: 400 });
      }
      const [created] = await db
        .insert(communityComments)
        .values({ postId: body.postId, authorId: user.id, content })
        .returning();
      return NextResponse.json({ comment: created }, { status: 201 });
    }

    const parsed = communityCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const [created] = await db
      .insert(communities)
      .values({
        creatorId: user.id,
        slug: generateSlug(parsed.data.name),
        name: parsed.data.name,
        description: parsed.data.description,
        rules:
          parsed.data.rules ||
          "الالتزام بآداب الحوار، واحترام الخصوصية، ومنع نشر البيانات الشخصية دون إذن.",
        category: parsed.data.category,
        privacy: parsed.data.privacy,
      })
      .returning();

    await db.insert(communityMembers).values({
      communityId: created.id,
      userId: user.id,
      role: "owner",
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "COMMUNITY_CREATED",
      targetType: "community",
      targetId: created.id,
    });

    return NextResponse.json({ community: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تنفيذ العملية" }, { status: 500 });
  }
}
