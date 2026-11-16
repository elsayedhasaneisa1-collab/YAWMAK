import React from "react";
import type { Metadata } from "next";
import { YawmakCard } from "@/components/ui/DesignSystem";

export const metadata: Metadata = {
  title: "الشروط والأحكام وإرشادات المجتمع",
  description: "شروط الاستخدام وسياسة المحتوى وإرشادات المجتمع في منصة YAWMAK | يومك.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">
          الشروط والأحكام وسياسة المحتوى
        </h1>
        <p className="text-xs text-[var(--yawmak-text-muted)]">
          تنويه قانوني: هذه السياسات مُعدة لتنظيم استخدام منصة YAWMAK | يومك، ويُنصح بمراجعتها قانونيًا قبل الإطلاق التجاري الكامل.
        </p>
      </div>

      <YawmakCard className="space-y-5 text-sm leading-relaxed text-[var(--yawmak-text-muted)]">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--yawmak-text)]">1. طبيعة المنصة والالتزام الديني</h2>
          <p>
            منصة YAWMAK | يومك مساحة تنظيم شخصية للمهام والتركيز والملاحظات والدعوات والحملات. يُمنع استخدام المنصة في أي محتوى مخالف للقانون أو الآداب العامة أو التضليل، أو نسب نصوص دينية غير موثقة إلى القرآن أو السنة.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--yawmak-text)]">2. العضويات والتوثيق</h2>
          <p>
            الخدمات الدينية الأساسية (القرآن، الأذكار، الأدعية، المسبحة، الصلاة، القبلة، التقويم الهجري) متاحة مجانًا. الباقات المدفوعة (PLUS / PRO / VIP) توسّع الحدود التقنية فقط، ولا يمنح الاشتراك شارة التوثيق تلقائيًا؛ بل يخضع التوثيق دائمًا لمراجعة بشرية مستقلة من الإدارة.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--yawmak-text)]">3. إرشادات المجتمع والمحتوى المحظور</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>يُحظر تمامًا انتهاك الخصوصية أو نشر أرقام الهواتف أو البيانات الشخصية للآخرين دون إذن.</li>
            <li>يُحظر انتحال الهوية، التحرش، الإساءة اللفظية، الاحتيال، أو نشر الروابط الضارة.</li>
            <li>لا يُسمح باستخدام الحملات أو المجتمعات للمفاضلة في الأجر والثواب أو التنافس الشكلي.</li>
            <li>تحتفظ الإدارة بحق إيقاف أو حذف المحتوى المخالف وتعليق أو حظر الحسابات المخالفة مع إتاحة حق الاعتراض عبر مركز الدعم.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--yawmak-text)]">4. حدود التخزين والبيانات</h2>
          <p>
            احتفظ بنسخ احتياطية منتظمة من أعمالك المهمة.
          </p>
        </section>
      </YawmakCard>
    </div>
  );
}
