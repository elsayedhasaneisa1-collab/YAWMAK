import { NextResponse } from "next/server";
import { db } from "@/db";
import { dhikrCounters, dhikrCounterContributors, invitations } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { dhikrContributionSchema } from "@/lib/validation";
import { checkRateLimit, getClientFingerprint, sha256Hex } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { COMMUNITY_DHIKR_COUNTERS } from "@/lib/islamic-data";

export const dynamic = "force-dynamic";

async function resolveScope(raw: string | null): Promise<{ scopeKey: string; invitationId: string | null }> {
  if (!raw || raw === "global") return { scopeKey: "global", invitationId: null };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    return { scopeKey: "global", invitationId: null };
  }
  const rows = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.id, raw))
    .limit(1);
  if (!rows.length) return { scopeKey: "global", invitationId: null };
  return { scopeKey: `inv:${rows[0].id}`, invitationId: rows[0].id };
}

async function ensureCounters(scopeKey: string, invitationId: string | null) {
  await db
    .insert(dhikrCounters)
    .values(
      COMMUNITY_DHIKR_COUNTERS.map((c) => ({
        scopeKey,
        invitationId,
        dhikrKey: c.key,
      }))
    )
    .onConflictDoNothing();
}

function shapeCounters(rows: Array<typeof dhikrCounters.$inferSelect>) {
  const map = new Map(rows.map((r) => [r.dhikrKey, r]));
  return COMMUNITY_DHIKR_COUNTERS.map((c) => {
    const row = map.get(c.key);
    return {
      key: c.key,
      text: c.text,
      label: c.label,
      target: c.target,
      totalCount: Number(row?.totalCount || 0),
      participantsCount: Number(row?.participantsCount || 0),
    };
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = await resolveScope(searchParams.get("scopeKey"));
    await ensureCounters(scope.scopeKey, scope.invitationId);

    const rows = await db
      .select()
      .from(dhikrCounters)
      .where(eq(dhikrCounters.scopeKey, scope.scopeKey));

    return NextResponse.json(
      {
        scopeKey: scope.scopeKey,
        invitationId: scope.invitationId,
        counters: shapeCounters(rows),
      },
      { headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=20" } }
    );
  } catch {
    return NextResponse.json({ error: "تعذر تحميل العدادات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = dhikrContributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const user = await getCurrentUser();
    const fp = getClientFingerprint(req, user?.id || "guest");

    const burst = await checkRateLimit(`dhikr-burst:${fp}`, 12, 60 * 1000);
    if (!burst.allowed) {
      return NextResponse.json(
        { error: "تسير التسبيحات بسرعة كبيرة، استرح لحظات ثم أكمل بخشوع." },
        { status: 429 }
      );
    }

    const hourly = await checkRateLimit(`dhikr-hour:${fp}`, 260, 60 * 60 * 1000);
    if (!hourly.allowed) {
      return NextResponse.json(
        { error: "وصلت إلى الحد الآمن للمساهمة خلال هذه الساعة." },
        { status: 429 }
      );
    }

    const scope = await resolveScope(parsed.data.scopeKey);
    await ensureCounters(scope.scopeKey, scope.invitationId);

    const counterRows = await db
      .select({ id: dhikrCounters.id })
      .from(dhikrCounters)
      .where(
        and(eq(dhikrCounters.scopeKey, scope.scopeKey), eq(dhikrCounters.dhikrKey, parsed.data.dhikrKey))
      )
      .limit(1);

    if (!counterRows.length) {
      return NextResponse.json({ error: "تعذر تسجيل المشاركة حاليًا" }, { status: 400 });
    }

    const counterId = counterRows[0].id;
    const amount = parsed.data.amount;

    await db
      .update(dhikrCounters)
      .set({
        totalCount: sql`${dhikrCounters.totalCount} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(dhikrCounters.id, counterId));

    const contributorHash = sha256Hex(`${scope.scopeKey}:${user?.id || fp}`);

    const fresh = await db
      .insert(dhikrCounterContributors)
      .values({ counterId, contributorHash, contributionCount: amount })
      .onConflictDoNothing()
      .returning({ id: dhikrCounterContributors.id });

    if (fresh.length > 0) {
      await db
        .update(dhikrCounters)
        .set({ participantsCount: sql`${dhikrCounters.participantsCount} + 1` })
        .where(eq(dhikrCounters.id, counterId));
    } else {
      await db
        .update(dhikrCounterContributors)
        .set({
          contributionCount: sql`${dhikrCounterContributors.contributionCount} + ${amount}`,
          lastContributedAt: new Date(),
        })
        .where(
          and(
            eq(dhikrCounterContributors.counterId, counterId),
            eq(dhikrCounterContributors.contributorHash, contributorHash)
          )
        );
    }

    const updated = await db
      .select()
      .from(dhikrCounters)
      .where(eq(dhikrCounters.id, counterId))
      .limit(1);

    return NextResponse.json({
      ok: true,
      key: parsed.data.dhikrKey,
      totalCount: Number(updated[0]?.totalCount || 0),
      participantsCount: Number(updated[0]?.participantsCount || 0),
    });
  } catch {
    return NextResponse.json({ error: "تعذر تسجيل المشاركة حاليًا" }, { status: 500 });
  }
}
