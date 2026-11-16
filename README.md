# YAWMAK | يومك — المنظومة الرقمية الإسلامية المتكاملة

> **«يومك… ببساطة وترتيب»** — Luxury Islamic Technology Platform

## نظرة عامة
**YAWMAK | يومك** منظومة رقمية إسلامية متكاملة مبنية بـ **Next.js App Router + TypeScript + Tailwind CSS + PostgreSQL (Drizzle ORM)** مع دعم كامل للغة العربية وRTL، وتجربة ترحيب سينمائية ثلاثية الأبعاد (**YAWMAK JOURNEY** باستخدام Three.js وGSAP)، ومحرك 8 سمات، ونظام عضويات وتوثيق بشري، ولوحة إدارة مستقلة (**YAWMAK CONTROL CENTER**).

## الأقسام المنفذة بالكامل
- **العبادة والروحانيات:** القرآن الكريم (`/quran`)، المسبحة الذكية (`/tasbih`)، مكتبة الأذكار الموثقة (`/adhkar`)، مكتبة الأدعية وصندوق الدعاء الخاص (`/dua`)، مواقيت الصلاة لمحافظات مصر الـ27 دون GPS (`/prayer`)، بوصلة القبلة (`/qibla`)، التقويم الهجري القابل للتعديل (`/hijri`).
- **الأثر والمجتمع والإبداع:** نظام الدعوات مع Open Graph ديناميكي (`/invitations` + `/invitations/[slug]`)، الحملات الجماعية (`/campaigns`)، المجتمعات الهادفة (`/community`)، الدفتر الشخصي والعادات والأهداف (`/journal`)، أرشيف الإنجازات (`/legacy`)، استوديو التصميم الفاخر مع تصدير PNG (`/studio`)، التحليلات الشخصية الحقيقية (`/analytics`).
- **الحساب والخصوصية:** التسجيل الآمن بـ Zod وحماية البوتات والمحافظة الإجبارية من 27 محافظة مصرية، تسجيل الدخول بدون OTP، إدارة الجلسات وخروج جميع الأجهزة، حذف الحساب النهائي، الإشعارات (`/profile`, `/settings/*`).
- **لوحة الإدارة (`YAWMAK CONTROL CENTER` — `/admin/*`):** 19 قسمًا إداريًا محميًا بصلاحيات الخادم (`Owner / Super Admin / Admin / Moderator / Support`) تشمل خريطة محافظات مصر الـ27 التفاعلية، مراقبة قاعدة البيانات، صحة الـ APIs، مركز التوثيق البشري، إدارة الأسعار والمدفوعات، وسجل التدقيق `audit_logs`.

## الخدمات الخارجية المجانية والحدود
- **AlAdhan API** (`api.aladhan.com`): لمواقيت الصلاة والتاريخ الهجري مع تخزين مؤقت (Cache 6 ساعات) ووضع احتياطي.
- **AlQuran Cloud / Islamic Network** (`api.alquran.cloud` & `cdn.islamic.network`): للنص القرآني بالرسم العثماني والتلاوات الصوتية مع Cache يومي.
- جميع الخدمات المجانية تخضع لسياسات الاستخدام العادل الخاصة بمزوديها ولا تُعدّ غير محدودة.

## الأمان وحماية قاعدة البيانات
- تشفير كلمات المرور باستخدام `crypto.scrypt` مع Salt فريد ومقارنة ثابتة الزمن.
- جلسات `HttpOnly` + `SameSite=Lax` + `Secure` في الإنتاج مع إبطال فوري للجلسات.
- تحويل `HTTP -> HTTPS` بـ `301` في الإنتاج، وترويسات CSP / HSTS / X-Frame-Options.
- فحص روابط صور Open Graph ضد هجمات **SSRF** ومنع العناوين الداخلية ورفض غير الصور النقطية (`PNG/JPG/WebP`).
- ملف سياسات **Row Level Security (RLS)** والقيود الجاهز لـ Supabase/PostgreSQL متوفر في: `supabase/migrations/001_yawmak_rls_and_indexes.sql`.

## إعداد التشغيل والنشر على Vercel
1. انسخ `.env.example` إلى `.env` واضبط `DATABASE_URL` و`NEXT_PUBLIC_SITE_URL` وبيانات حساب المالك الأولي.
2. نفّذ دفع الجداول لقاعدة البيانات:
   ```bash
   npx drizzle-kit push
   ```
3. عند النشر على Supabase، طبّق ملف `supabase/migrations/001_yawmak_rls_and_indexes.sql`.
4. للتحقق والبناء:
   ```bash
   npx next typegen
   npm exec tsc -- --noEmit
   npm run build
   ```
5. ارفع المشروع إلى **Vercel** واضبط متغيرات البيئة في إعدادات Vercel دون رفع ملف `.env` أبدًا.
