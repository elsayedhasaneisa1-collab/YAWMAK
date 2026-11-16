import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { phoneSchema } from "@/lib/validation";
import { checkRateLimit, getClientFingerprint } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsedPhone = phoneSchema.safeParse(body?.phone || "");
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 400) : "";

    if (!parsedPhone.success) {
      return NextResponse.json({ error: "يرجى إدخال رقم هاتف بصيغة صحيحة" }, { status: 400 });
    }

    const fp = getClientFingerprint(req, parsedPhone.data.slice(-4));
    const rl = await checkRateLimit(`recover:${fp}`, 4, 30 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز عدد محاولات الاستعادة. حاول بعد ${rl.retryAfterSeconds} ثانية.` },
        { status: 429 }
      );
    }

    // Security rule: Never reveal whether phone exists, and never use password hint as automated recovery!
    await db.insert(supportTickets).values({
      contactInfo: parsedPhone.data,
      category: "support",
      subject: "طلب استعادة كلمة المرور — تحقق يدوي",
      message: `طلب استعادة وصول لحساب مرتبط بالرقم المذكور. ملاحظة المستخدم: ${note || "لا توجد ملاحظات إضافية"}.`,
      status: "open",
    });

    return NextResponse.json({
      ok: true,
      message:
        "إذا كان الرقم مسجلًا لدينا، فقد تم إنشاء تذكرة تحقق آمنة لدى فريق الدعم. حفاظًا على أمان حسابك، لا نعتمد على تلميح كلمة المرور كبديل آمن للاستعادة ولا نستخدم رسائل SMS غير موثقة.",
    });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال الطلب حاليًا" }, { status: 500 });
  }
}
