import { NextResponse } from "next/server";
import { db } from "@/db";
import { legacyItems, profiles } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser, requireUser, AuthError } from "@/lib/auth";
import { legacyCreateSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "mine";

    if (scope === "public") {
      const list = await db
        .select({
          id: legacyItems.id,
          slug: legacyItems.slug,
          title: legacyItems.title,
          category: legacyItems.category,
          description: legacyItems.description,
          externalUrl: legacyItems.externalUrl,
          createdAt: legacyItems.createdAt,
          ownerName: profiles.username,
          ownerBadge: profiles.verificationBadge,
        })
        .from(legacyItems)
        .innerJoin(profiles, eq(legacyItems.userId, profiles.id))
        .where(eq(legacyItems.isPublic, true))
        .orderBy(desc(legacyItems.createdAt))
        .limit(40);
      return NextResponse.json({ items: list });
    }

    if (!user) return NextResponse.json({ items: [] });
    const list = await db
      .select()
      .from(legacyItems)
      .where(eq(legacyItems.userId, user.id))
      .orderBy(desc(legacyItems.createdAt))
      .limit(60);

    return NextResponse.json({ items: list });
  } catch {
    return NextResponse.json({ error: "تعذر جلب السجل" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const parsed = legacyCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const [created] = await db
      .insert(legacyItems)
      .values({
        userId: user.id,
        slug: generateSlug(parsed.data.title),
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        externalUrl: parsed.data.externalUrl || null,
        isPublic: parsed.data.isPublic,
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر الحفظ" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    const [updated] = await db
      .update(legacyItems)
      .set({ isPublic: Boolean(body.isPublic), updatedAt: new Date() })
      .where(and(eq(legacyItems.id, id), eq(legacyItems.userId, user.id)))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحديث الخصوصية" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    await db.delete(legacyItems).where(and(eq(legacyItems.id, id), eq(legacyItems.userId, user.id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
