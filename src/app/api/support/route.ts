import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, systemSettings } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { supportTicketSchema } from "@/lib/validation";
import { checkRateLimit, getClientFingerprint } from "@/lib/security";
import { DEFAULT_SUPPORT_CONTACTS } from "@/lib/constants";
import { ensureSeeded } from "@/db/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();

    const settingsRows = await db
      .select()
      .from(systemSettings)
      .where(inArray(systemSettings.key, ["support_contacts", "faqs", "announcements"]));

    const map = new Map(settingsRows.map((s) => [s.key, s.value]));

    const myTickets = user
      ? await db
          .select()
          .from(supportTickets)
          .where(eq(supportTickets.userId, user.id))
          .orderBy(desc(supportTickets.createdAt))
          .limit(20)
      : [];

    return NextResponse.json({
      contacts: map.get("support_contacts") || DEFAULT_SUPPORT_CONTACTS,
      faqs: map.get("faqs") || [],
      announcements: map.get("announcements") || [],
      myTickets,
    });
  } catch {
    return NextResponse.json({
      contacts: DEFAULT_SUPPORT_CONTACTS,
      faqs: [],
      announcements: [],
      myTickets: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();
    const fp = getClientFingerprint(req, user?.id || "guest");
    const rl = await checkRateLimit(`support:${fp}`, 5, 30 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "تم إرسال عدة طلبات مؤخرًا، يرجى المحاولة لاحقًا" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = supportTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        userId: user?.id || null,
        contactInfo: parsed.data.contactInfo,
        category: parsed.data.category,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: "open",
      })
      .returning();

    return NextResponse.json(
      { ticket, message: "تم فتح تذكرة الدعم بنجاح وسيتابعها فريق يومك في أقرب وقت." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "تعذر إرسال التذكرة" }, { status: 500 });
  }
}
