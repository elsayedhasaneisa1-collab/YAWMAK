import { db } from "@/db";
import {
  membershipPlans,
  systemSettings,
  profiles,
  campaigns,
  communities,
  apiHealthChecks,
  userSettings,
} from "@/db/schema";
import { DEFAULT_SUPPORT_CONTACTS } from "@/lib/constants";
import { hashPassword } from "@/lib/security";
import { eq } from "drizzle-orm";

let seededPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seededPromise) {
    seededPromise = runSeed().catch((err) => {
      seededPromise = null;
      throw err;
    });
  }
  return seededPromise;
}

async function runSeed(): Promise<void> {
  // 1. Seed official Membership Plans (idempotent)
  const plans = [
    {
      code: "FREE",
      nameAr: "الباقة المجانية",
      nameEn: "FREE",
      priceEgp: 0,
      invitationLimit: 5,
      invitationLimitScope: "lifetime",
      habitLimit: 3,
      ogImageLimit: 0,
      canVerify: false,
      verificationPriority: 0,
      canUploadAvatar: false,
      canUseStudio: false,
      canCreatePrivateCampaign: false,
      canCreateCommunity: false,
      badgeLabel: null,
      features: [
        "القرآن الكريم والتلاوة وعلامات القراءة",
        "المسبحة والأذكار والأدعية الموثقة",
        "مواقيت الصلاة وبوصلة القبلة والتقويم الهجري",
        "الملف الشخصي والمفضلة والدفتر الشخصي والأهداف",
        "3 عادات يومية",
        "5 دعوات طوال عمر الحساب",
        "قوالب أساسية والمشاركة في الحملات العامة",
        "الإبلاغ عن المحتوى المخالف",
      ],
    },
    {
      code: "PLUS",
      nameAr: "باقة بلس",
      nameEn: "PLUS",
      priceEgp: 30,
      invitationLimit: 25,
      invitationLimitScope: "monthly",
      habitLimit: 10,
      ogImageLimit: 0,
      canVerify: true,
      verificationPriority: 1,
      canUploadAvatar: true,
      canUseStudio: false,
      canCreatePrivateCampaign: false,
      canCreateCommunity: false,
      badgeLabel: "PLUS VERIFIED",
      features: [
        "جميع مميزات الباقة المجانية",
        "25 دعوة شهريًا",
        "10 عادات يومية",
        "قوالب إضافية وألوان وخلفيات فاخرة",
        "محرر بطاقات أساسي وإحصائيات وتقارير أسبوعية",
        "تذكيرات وأرشيف موسع ورفع صورة شخصية",
        "أهلية طلب التوثيق البشري (شارة PLUS VERIFIED بعد المراجعة)",
      ],
    },
    {
      code: "PRO",
      nameAr: "باقة برو",
      nameEn: "PRO",
      priceEgp: 60,
      invitationLimit: 100,
      invitationLimitScope: "monthly",
      habitLimit: 30,
      ogImageLimit: 5,
      canVerify: true,
      verificationPriority: 2,
      canUploadAvatar: true,
      canUseStudio: true,
      canCreatePrivateCampaign: true,
      canCreateCommunity: true,
      badgeLabel: "PRO VERIFIED",
      features: [
        "جميع مميزات باقة PLUS",
        "100 دعوة شهريًا و30 عادة يومية",
        "5 روابط صور Open Graph مخصصة للحساب قابلة لإعادة الاستخدام",
        "حملات خاصة وعامة وإدارة المشاركين والمشرفين",
        "خطط ختم القرآن والعلامات المرجعية والملاحظات المتقدمة",
        "إحصائيات متقدمة وأولوية توثيق أعلى (PRO VERIFIED بعد المراجعة)",
      ],
    },
    {
      code: "VIP",
      nameAr: "باقة في آي بي الملكية",
      nameEn: "VIP",
      priceEgp: 100,
      invitationLimit: -1,
      invitationLimitScope: "fair_use",
      habitLimit: -1,
      ogImageLimit: 50,
      canVerify: true,
      verificationPriority: 3,
      canUploadAvatar: true,
      canUseStudio: true,
      canCreatePrivateCampaign: true,
      canCreateCommunity: true,
      badgeLabel: "VIP VERIFIED",
      features: [
        "جميع مميزات باقة PRO",
        "دعوات وعادات غير محدودة (وفق ضوابط الاستخدام العادل)",
        "50 رابط صورة Open Graph مخصصة للحساب",
        "الوصول الكامل إلى YAWMAK STUDIO وYAWMAK COMMUNITY وYAWMAK ANALYTICS",
        "تقارير وتحليلات متقدمة وتخصيص شامل",
        "أعلى أولوية لطلبات التوثيق البشري (VIP VERIFIED بعد المراجعة)",
      ],
    },
  ];

  for (const plan of plans) {
    await db
      .insert(membershipPlans)
      .values(plan)
      .onConflictDoNothing({ target: membershipPlans.code });
  }

  // 2. Seed System Settings (editable from YAWMAK Control Center)
  const defaultSettings: Array<{ key: string; value: unknown }> = [
    { key: "support_contacts", value: DEFAULT_SUPPORT_CONTACTS },
    {
      key: "payment_methods",
      value: [
        { id: "vodafone_cash", nameAr: "فودافون كاش / محفظة إلكترونية", instructions: "حوّل على الرقم 01041254010 أو 01550802408 ثم أدخل رقم العملية للمراجعة البشرية.", active: true },
        { id: "instapay", nameAr: "إنستا باي (InstaPay)", instructions: "أكمل التحويل ثم أرفق مرجع التحويل وسيتم تفعيل الاشتراك بعد التحقق اليدوي من الإدارة.", active: true },
        { id: "bank_transfer", nameAr: "تحويل بنكي", instructions: "تواصل مع الدعم الفني لاستلام تفاصيل الحساب ثم أدخل رقم المرجع البنكي.", active: true },
      ],
    },
    {
      key: "announcements",
      value: [
        {
          id: "welcome-launch",
          title: "مرحبًا بكم في منظومة يومك الرقمية",
          body: "منصة رقمية إسلامية تجمع بين القرآن الكريم والأذكار والمسبحة والحملات الجماعية واستوديو التصميم في بيئة تحترم خصوصيتك.",
          active: true,
        },
      ],
    },
    {
      key: "faqs",
      value: [
        {
          q: "هل الاشتراك في باقة مدفوعة يمنح شارة التوثيق تلقائيًا؟",
          a: "لا. الاشتراك المدفوع يحدد أهليتك وأولويتك لتقديم طلب التوثيق فقط، ولا تُمنح أي شارة توثيق إلا بعد مراجعة بشرية كاملة من فريق إدارة يومك.",
        },
        {
          q: "لماذا اختيار المحافظة إجباري عند التسجيل؟",
          a: "يُستخدم اختيار المحافظة فقط لضبط مواقيت الصلاة الافتراضية ولإحصائيات مجمّعة عامة على مستوى المنصة دون عرضها للعامة أو استخدام GPS.",
        },
        {
          q: "هل تظهر بياناتي الخاصة مثل رقم الهاتف أو النوع للآخرين؟",
          a: "أبدًا. رقم الهاتف والبريد الخاص والنوع والمحافظة وتلميح كلمة المرور تظل سرية بالكامل ولا تظهر في الملف العام ولا في معاينات Open Graph.",
        },
        {
          q: "ما المقصود بحدود صور Open Graph لكل حساب؟",
          a: "لأعضاء PRO VERIFIED حتى 5 روابط صور مباشرة (HTTPS) ولأعضاء VIP VERIFIED حتى 50 رابطًا لكل حساب، ويمكن إعادة استخدامها عبر عدة دعوات دون رفع ملفات.",
        },
      ],
    },
    {
      key: "site_content",
      value: {
        heroTitle: "يومك… ببساطة وترتيب",
        heroSubtitle:
          "منظومة رقمية إسلامية متكاملة تجمع بين القرآن الكريم، الأذكار الموثقة، المسبحة، مواقيت الصلاة، الدعوات، الحملات الخيرية، المجتمعات الهادفة، واستوديو التصميم الفاخر.",
      },
    },
  ];

  for (const setting of defaultSettings) {
    await db
      .insert(systemSettings)
      .values(setting)
      .onConflictDoNothing({ target: systemSettings.key });
  }

  // 3. Seed external API Health Check monitors
  const apis = [
    { apiName: "AlAdhan Prayer & Hijri", endpoint: "https://api.aladhan.com/v1/timingsByCity" },
    { apiName: "AlQuran Cloud", endpoint: "https://api.alquran.cloud/v1/surah" },
    { apiName: "MP3Quran Reciters", endpoint: "https://mp3quran.net/api/v3/reciters?language=ar" },
  ];
  for (const api of apis) {
    await db
      .insert(apiHealthChecks)
      .values({ ...api, status: "healthy", responseTimeMs: 0, checksCount: 0, errorCount: 0 })
      .onConflictDoNothing({ target: apiHealthChecks.apiName });
  }

  // 4. Seed initial Platform Owner account if none exists
  const ownerPhone = process.env.YAWMAK_OWNER_PHONE || "01550802408";
  const ownerPassword = process.env.YAWMAK_OWNER_PASSWORD || "YawmakOwner2026!";

  const existingOwner = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.phone, ownerPhone))
    .limit(1);

  let ownerId: string;
  if (existingOwner.length === 0) {
    const [created] = await db
      .insert(profiles)
      .values({
        username: "إدارة يومك الرسمية",
        phone: ownerPhone,
        email: "elsayedhasaneisa1@gmail.com",
        passwordHash: hashPassword(ownerPassword),
        passwordHint: "حساب مالك المنصة الأساسي",
        gender: "male",
        governorate: "القاهرة",
        role: "owner",
        accountStatus: "active",
        membershipPlan: "VIP",
        verificationStatus: "approved",
        verificationBadge: "VIP VERIFIED",
        onboardingCompleted: true,
        bio: "الحساب الرسمي لإدارة منصة يومك.",
        publicProfile: true,
      })
      .returning({ id: profiles.id });
    ownerId = created.id;

    await db
      .insert(userSettings)
      .values({ userId: ownerId, prayerCity: "القاهرة" })
      .onConflictDoNothing();
  } else {
    ownerId = existingOwner[0].id;
  }

  // 5. Seed initial authentic public campaigns & communities so platform starts alive (real DB rows)
  const initialCampaigns = [
    {
      creatorId: ownerId,
      slug: "ramadan-khatma-yawmak",
      title: "حملة الختمة الجماعية الشهرية للقرآن الكريم",
      description:
        "انضم إلى مبادرة قراءة وتدبر القرآن الكريم مع توزيع الأجزاء والمهام اليومية بروح هادئة ومنظمة بعيدًا عن التنافس الشكلي.",
      category: "khatma",
      goalTarget: 300,
      currentProgress: 42,
      unitLabel: "جزء مقروء",
      visibility: "public",
      status: "active",
      isFeatured: true,
    },
    {
      creatorId: ownerId,
      slug: "morning-evening-adhkar-circle",
      title: "حملة المداومة على أذكار الصباح والمساء",
      description:
        "حملة يومية تذكيرية لتحصين اليوم بأذكار الصباح والمساء الموثقة من الكتاب والسنة مع متابعة هادئة للالتزام.",
      category: "adhkar",
      goalTarget: 500,
      currentProgress: 87,
      unitLabel: "يوم التزام",
      visibility: "public",
      status: "active",
      isFeatured: true,
    },
  ];

  for (const camp of initialCampaigns) {
    await db
      .insert(campaigns)
      .values(camp)
      .onConflictDoNothing({ target: campaigns.slug });
  }

  const initialCommunities = [
    {
      creatorId: ownerId,
      slug: "ahl-alquran-yawmak",
      name: "مجتمع أهل القرآن والتدبر",
      description:
        "مساحة هادئة لتبادل الفوائد القرآنية، وخطط الختم، وتشجيع المداومة على الورد اليومي بضوابط الخصوصية الكاملة.",
      rules:
        "1. الالتزام بالمصادر الموثقة.\n2. احترام الخصوصية ومنع نشر أي أرقام أو بيانات شخصية.\n3. تجنب الجدل العقيم والمفاضلة في الأعمال.",
      category: "quran",
      privacy: "public",
      status: "active",
    },
    {
      creatorId: ownerId,
      slug: "yawmak-good-deeds",
      name: "مجتمع صناع الخير والعمل النافع",
      description:
        "تجمع للمبادرات المجتمعية الهادفة، وتنسيق الحملات التطوعية، ومشاركة بطاقات الدعوة إلى الخير.",
      rules:
        "1. المصداقية التامة في عرض المبادرات.\n2. عدم جمع تبرعات عبر حسابات شخصية غير موثقة.\n3. الاحترام المتبادل والالتزام بآداب الحوار.",
      category: "charity",
      privacy: "public",
      status: "active",
    },
  ];

  for (const comm of initialCommunities) {
    await db
      .insert(communities)
      .values(comm)
      .onConflictDoNothing({ target: communities.slug });
  }
}
