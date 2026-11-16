import { NextResponse } from "next/server";
import { db } from "@/db";
import { quranReadings, invitations } from "@/db/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { quranReadingSchema } from "@/lib/validation";
import { checkRateLimit, getClientFingerprint } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function resolveInvitation(raw: string | null): Promise<string | null> {
  if (!raw) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) return null;
  const rows = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(eq(invitations.id, raw))
    .limit(1);
  return rows.length ? rows[0].id : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invitationId = await resolveInvitation(searchParams.get("invitationId"));

    const conditions = invitationId ? eq(quranReadings.invitationId, invitationId) : undefined;

    const [totals, bySurah] = await Promise.all([
      db
        .select({ total: count() })
        .from(quranReadings)
        .where(conditions),
      db
        .select({
          surahNumber: quranReadings.surahNumber,
          surahName: quranReadings.surahName,
          total: count(),
        })
        .from(quranReadings)
        .where(conditions)
        .groupBy(quranReadings.surahNumber, quranReadings.surahName)
        .orderBy(desc(count()))
        .limit(12),
    ]);

    return NextResponse.json(
      {
        invitationId,
        totalReadings: Number(totals[0]?.total || 0),
        bySurah: bySurah.map((s) => ({
          surahNumber: s.surahNumber,
          surahName: s.surahName || `سورة رقم ${s.surahNumber}`,
          total: Number(s.total),
        })),
      },
      { headers: { "Cache-Control": "public, max-age=20, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ error: "تعذر تحميل سجل القراءات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = quranReadingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const user = await getCurrentUser();
    const fp = getClientFingerprint(req, user?.id || "guest");

    const rl = await checkRateLimit(`quran-read:${fp}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تم تسجيل عدد كافٍ من القراءات المكتملة خلال هذه الفترة." },
        { status: 429 }
      );
    }

    const invitationId = await resolveInvitation(
      parsed.data.invitationId ? String(parsed.data.invitationId) : null
    );

    await db.insert(quranReadings).values({
      userId: user?.id || null,
      invitationId,
      contributorHash: user?.id ? null : fp.slice(0, 32),
      surahNumber: parsed.data.surahNumber,
      surahName: parsed.data.surahName.slice(0, 80) || `سورة رقم ${parsed.data.surahNumber}`,
    });

    const totals = await db
      .select({ total: count() })
      .from(quranReadings)
      .where(invitationId ? eq(quranReadings.invitationId, invitationId) : sql`true`);

    return NextResponse.json(
      {
        ok: true,
        surahNumber: parsed.data.surahNumber,
        totalReadings: Number(totals[0]?.total || 0),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "تعذر تسجيل إتمام القراءة" }, { status: 500 });
  }
}
