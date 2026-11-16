import { z } from "zod";
import { OFFICIAL_GOVERNORATE_NAMES, INVITATION_TYPES } from "./constants";

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s\-()]/g, "");
  if (trimmed.startsWith("+20")) return "0" + trimmed.slice(3);
  if (trimmed.startsWith("0020")) return "0" + trimmed.slice(4);
  if (trimmed.startsWith("20") && trimmed.length === 12) return "0" + trimmed.slice(2);
  return trimmed;
}

export const governorateSchema = z
  .string()
  .trim()
  .refine((val) => OFFICIAL_GOVERNORATE_NAMES.includes(val), {
    message: "يرجى اختيار محافظة صحيحة من محافظات مصر المعتمدة",
  });

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
  .max(30, "اسم المستخدم لا يزيد عن 30 حرفًا")
  .regex(/^[\u0600-\u06FFa-zA-Z0-9_.\s]+$/, "اسم المستخدم يحتوي على رموز غير مسموحة")
  .refine((v) => !/\s{2,}/.test(v), "يُمنع تكرار المسافات المتتالية");

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((val) => /^01[0125][0-9]{8}$/.test(val) || /^\+?[0-9]{10,15}$/.test(val), {
    message: "يرجى إدخال رقم هاتف صحيح (مثال: 010xxxxxxxx)",
  });

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(72, "كلمة المرور طويلة جدًا")
  .refine((p) => /[A-Za-z\u0600-\u06FF]/.test(p) && /[0-9]/.test(p), {
    message: "كلمة المرور يجب أن تحتوي على أحرف وأرقام على الأقل",
  });

export const registerSchema = z
  .object({
    username: usernameSchema,
    phone: phoneSchema,
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
        message: "صيغة البريد الإلكتروني غير صحيحة",
      }),
    password: passwordSchema,
    passwordHint: z
      .string()
      .trim()
      .min(3, "تلميح كلمة المرور يجب أن يكون 3 أحرف على الأقل")
      .max(80, "تلميح كلمة المرور لا يزيد عن 80 حرفًا"),
    gender: z.enum(["male", "female"], {
      error: "يرجى اختيار النوع",
    }),
    governorate: governorateSchema,
    termsAccepted: z.literal(true, {
      error: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية",
    }),
    websiteTrap: z.string().max(0, "طلب غير صالح").optional().default(""),
    formStartedAt: z.number().optional(),
  })
  .refine((data) => data.passwordHint.toLowerCase() !== data.password.toLowerCase(), {
    message: "لا يُسمح بأن يكون تلميح كلمة المرور مطابقًا لكلمة المرور نفسها",
    path: ["passwordHint"],
  })
  .refine((data) => !data.password.toLowerCase().includes(data.passwordHint.toLowerCase()) || data.passwordHint.length < 4, {
    message: "اجعل التلميح تذكيريًا ولا يطابق جزءًا كبيرًا من كلمة المرور",
    path: ["passwordHint"],
  });

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "يرجى إدخال كلمة المرور").max(72),
  websiteTrap: z.string().max(0).optional().default(""),
});

export const invitationCreateSchema = z.object({
  type: z.enum(INVITATION_TYPES.map((t) => t.id) as [string, ...string[]]),
  title: z.string().trim().min(3, "العنوان مطلوب (3 أحرف على الأقل)").max(120),
  description: z.string().trim().min(10, "الوصف مطلوب (10 أحرف على الأقل)").max(1200),
  templateId: z.string().trim().max(40).default("emerald-royal"),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#B89545"),
  fontFamily: z.enum(["amiri", "cairo", "tajawal"]).default("amiri"),
  bgStyle: z.string().trim().max(40).default("midnight-emerald"),
  targetUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "الرابط يجب أن يبدأ بـ https://"),
  ogImageId: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published", "paused"]).default("published"),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const mourningMetadataSchema = z.object({
  deceasedName: z
    .string()
    .trim()
    .min(2, "اسم المتوفى مطلوب (حرفان على الأقل)")
    .max(80, "اسم المتوفى طويل جدًا")
    .regex(/^[\u0600-\u06FFa-zA-Z\s.'-]+$/, "اسم المتوفى يحتوي على رموز غير مسموحة"),
  deceasedPhotoUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "رابط الصورة يجب أن يبدأ بـ https://"),
  deceasedDate: z.string().trim().max(40).optional().default(""),
  senderMessage: z
    .string()
    .trim()
    .min(5, "رسالة صاحب الدعوة مطلوبة")
    .max(600, "رسالة صاحب الدعوة طويلة جدًا"),
  dedicationDua: z.string().trim().max(600).optional().default(""),
});

export const weddingAttendanceSchema = z.object({
  groomName: z.string().trim().min(2, "اسم العريس مطلوب").max(60),
  brideName: z.string().trim().min(2, "اسم العروس مطلوبة").max(60),
  groomFamily: z.string().trim().max(80).optional().default(""),
  brideFamily: z.string().trim().max(80).optional().default(""),
  eventDate: z.string().trim().min(3, "التاريخ مطلوب").max(60),
  eventTime: z.string().trim().max(30).optional().default(""),
  venue: z.string().trim().min(3, "مكان الحفل مطلوب").max(120),
  venueUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "الرابط يجب أن يبدأ بـ https://"),
  invitationMessage: z.string().trim().min(5, "رسالة الدعوة مطلوبة").max(600),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "رابط الصورة يجب أن يبدأ بـ https://"),
});

export const weddingCongratsSchema = z.object({
  groomName: z.string().trim().min(2, "اسم العريس مطلوب").max(60),
  brideName: z.string().trim().min(2, "اسم العروس مطلوبة").max(60),
  message: z.string().trim().min(5, "رسالة التهنئة مطلوبة").max(600),
  senderName: z.string().trim().max(60).optional().default(""),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "رابط الصورة يجب أن يبدأ بـ https://"),
});

export const birthdaySchema = z.object({
  personName: z.string().trim().min(2, "الاسم مطلوب").max(60),
  occasion: z.string().trim().min(3, "المناسبة مطلوبة").max(80).default("عيد ميلاد"),
  eventDate: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(5, "الرسالة مطلوبة").max(600),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "رابط الصورة يجب أن يبدأ بـ https://"),
});

export const congratsSchema = z.object({
  personName: z.string().trim().min(2, "الاسم مطلوب").max(60),
  occasion: z.string().trim().min(3, "المناسبة مطلوبة").max(80).default("تهنئة"),
  message: z.string().trim().min(5, "الرسالة مطلوبة").max(600),
  senderName: z.string().trim().max(60).optional().default(""),
});

export const invitationMetadataSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .default({});

export const dhikrContributionSchema = z.object({
  dhikrKey: z.enum([
    "subhanallah",
    "alhamdulillah",
    "la_ilaha_illa_allah",
    "allahu_akbar",
    "astaghfirullah",
    "subhanallah_wabihamdihi",
    "la_hawla_wa_quwwata_illa_billah",
  ]),
  amount: z.number().int().min(1).max(25),
  scopeKey: z.string().trim().max(60).optional().default("global"),
});

export const quranReadingSchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  surahName: z.string().trim().max(80).optional().default(""),
  invitationId: z.string().uuid().optional().nullable(),
});

export const campaignCreateSchema = z.object({
  title: z.string().trim().min(4, "عنوان الحملة مطلوب").max(120),
  description: z.string().trim().min(12, "وصف الحملة مطلوب").max(2000),
  category: z.enum(["khatma", "adhkar", "charity", "dua", "education"]).default("khatma"),
  goalTarget: z.number().int().min(1).max(1000000),
  unitLabel: z.string().trim().min(2).max(40).default("مشاركة"),
  visibility: z.enum(["public", "private"]).default("public"),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "رابط الصورة يجب أن يكون HTTPS"),
  endsAt: z.string().optional().nullable(),
});

export const communityCreateSchema = z.object({
  name: z.string().trim().min(3, "اسم المجتمع مطلوب").max(80),
  description: z.string().trim().min(12, "وصف المجتمع مطلوب").max(1000),
  rules: z.string().trim().min(10).max(1500).optional(),
  category: z.enum(["quran", "adhkar", "habits", "charity", "knowledge"]).default("quran"),
  privacy: z.enum(["public", "private"]).default("public"),
});

export const journalEntrySchema = z.object({
  title: z.string().trim().min(2, "العنوان مطلوب").max(140),
  content: z.string().trim().min(3, "المحتوى مطلوب").max(8000),
  category: z.enum(["reflection", "plan", "dua", "quran", "gratitude", "reminder"]).default("reflection"),
  isFavorite: z.boolean().optional().default(false),
  reminderAt: z.string().optional().nullable(),
});

export const habitCreateSchema = z.object({
  title: z.string().trim().min(2, "اسم العادة مطلوب").max(80),
  category: z.enum(["worship", "quran", "adhkar", "knowledge", "charity", "personal"]).default("worship"),
  targetCount: z.number().int().min(1).max(1000).default(1),
});

export const goalCreateSchema = z.object({
  title: z.string().trim().min(2, "عنوان الهدف مطلوب").max(100),
  description: z.string().trim().max(600).optional().default(""),
  category: z.enum(["quran", "adhkar", "habits", "charity", "knowledge"]).default("quran"),
  targetValue: z.number().int().min(1).max(100000),
  unit: z.string().trim().min(1).max(30).default("جزء"),
  deadline: z.string().optional().nullable(),
});

export const legacyCreateSchema = z.object({
  title: z.string().trim().min(3, "العنوان مطلوب").max(120),
  category: z.enum(["initiative", "project", "charity", "article", "resource"]).default("initiative"),
  description: z.string().trim().min(10, "الوصف مطلوب").max(2000),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "الرابط يجب أن يبدأ بـ https://"),
  isPublic: z.boolean().default(false),
});

export const supportTicketSchema = z.object({
  contactInfo: z.string().trim().min(5, "يرجى إدخال وسيلة تواصل صالحة").max(120),
  category: z.enum(["support", "issue", "privacy", "appeal", "other"]).default("support"),
  subject: z.string().trim().min(4, "عنوان الطلب مطلوب").max(140),
  message: z.string().trim().min(10, "يرجى توضيح تفاصيل الطلب").max(3000),
});

export const reportCreateSchema = z.object({
  targetType: z.enum(["invitation", "campaign", "community", "post", "comment", "user"]),
  targetId: z.string().trim().min(1).max(120),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(1000).optional().default(""),
});

export const subscriptionRequestSchema = z.object({
  planCode: z.enum(["PLUS", "PRO", "VIP"]),
  paymentMethod: z.enum(["vodafone_cash", "instapay", "bank_transfer", "manual_review"]),
  paymentReference: z.string().trim().min(4, "يرجى إدخال رقم العملية أو المرجع").max(100),
});

export const verificationRequestSchema = z.object({
  fullName: z.string().trim().min(4, "يرجى إدخال الاسم الكامل للمراجعة").max(100),
  reason: z.string().trim().min(12, "يرجى توضيح سبب طلب التوثيق ونشاطك").max(1000),
  referenceUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https:\/\/.+/.test(v), "الرابط المرجعي يجب أن يبدأ بـ https://"),
});
