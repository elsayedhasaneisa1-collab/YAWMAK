export interface GovernorateInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  region: "delta" | "canal" | "cairo" | "upper" | "frontier";
}

export const EGYPT_GOVERNORATES: readonly GovernorateInfo[] = [
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", lat: 30.0444, lng: 31.2357, mapX: 256, mapY: 162, region: "cairo" },
  { id: "giza", nameAr: "الجيزة", nameEn: "Giza", lat: 30.0131, lng: 31.2089, mapX: 224, mapY: 186, region: "cairo" },
  { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", lat: 31.2001, lng: 29.9187, mapX: 188, mapY: 88, region: "delta" },
  { id: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia", lat: 30.3292, lng: 31.2168, mapX: 252, mapY: 138, region: "delta" },
  { id: "beheira", nameAr: "البحيرة", nameEn: "Beheira", lat: 30.8481, lng: 30.3436, mapX: 210, mapY: 112, region: "delta" },
  { id: "matrouh", nameAr: "مطروح", nameEn: "Matrouh", lat: 31.3543, lng: 27.2373, mapX: 98, mapY: 114, region: "frontier" },
  { id: "kafr_el_sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", lat: 31.1107, lng: 30.9388, mapX: 238, mapY: 84, region: "delta" },
  { id: "gharbia", nameAr: "الغربية", nameEn: "Gharbia", lat: 30.8754, lng: 31.0335, mapX: 242, mapY: 108, region: "delta" },
  { id: "monufia", nameAr: "المنوفية", nameEn: "Monufia", lat: 30.5972, lng: 30.9876, mapX: 236, mapY: 128, region: "delta" },
  { id: "dakahlia", nameAr: "الدقهلية", nameEn: "Dakahlia", lat: 31.1656, lng: 31.4913, mapX: 268, mapY: 96, region: "delta" },
  { id: "damietta", nameAr: "دمياط", nameEn: "Damietta", lat: 31.4175, lng: 31.8144, mapX: 282, mapY: 74, region: "delta" },
  { id: "port_said", nameAr: "بورسعيد", nameEn: "Port Said", lat: 31.2653, lng: 32.3019, mapX: 310, mapY: 86, region: "canal" },
  { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia", lat: 30.5965, lng: 32.2715, mapX: 308, mapY: 126, region: "canal" },
  { id: "suez", nameAr: "السويس", nameEn: "Suez", lat: 29.9668, lng: 32.5498, mapX: 312, mapY: 162, region: "canal" },
  { id: "north_sinai", nameAr: "شمال سيناء", nameEn: "North Sinai", lat: 31.1321, lng: 33.8033, mapX: 368, mapY: 108, region: "frontier" },
  { id: "south_sinai", nameAr: "جنوب سيناء", nameEn: "South Sinai", lat: 28.9722, lng: 33.6176, mapX: 366, mapY: 196, region: "frontier" },
  { id: "sharqia", nameAr: "الشرقية", nameEn: "Sharqia", lat: 30.7327, lng: 31.7195, mapX: 280, mapY: 124, region: "delta" },
  { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum", lat: 29.3084, lng: 30.8428, mapX: 230, mapY: 204, region: "upper" },
  { id: "beni_suef", nameAr: "بني سويف", nameEn: "Beni Suef", lat: 29.0661, lng: 31.0994, mapX: 256, mapY: 222, region: "upper" },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya", lat: 28.1099, lng: 30.7503, mapX: 248, mapY: 258, region: "upper" },
  { id: "asyut", nameAr: "أسيوط", nameEn: "Asyut", lat: 27.1783, lng: 31.1859, mapX: 266, mapY: 296, region: "upper" },
  { id: "new_valley", nameAr: "الوادي الجديد", nameEn: "New Valley", lat: 25.4514, lng: 30.5464, mapX: 146, mapY: 324, region: "frontier" },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag", lat: 26.5569, lng: 31.6948, mapX: 288, mapY: 324, region: "upper" },
  { id: "qena", nameAr: "قنا", nameEn: "Qena", lat: 26.1551, lng: 32.716, mapX: 314, mapY: 344, region: "upper" },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor", lat: 25.6872, lng: 32.6396, mapX: 316, mapY: 368, region: "upper" },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan", lat: 24.0889, lng: 32.8998, mapX: 312, mapY: 418, region: "upper" },
  { id: "red_sea", nameAr: "البحر الأحمر", nameEn: "Red Sea", lat: 27.2579, lng: 33.8116, mapX: 366, mapY: 310, region: "frontier" },
] as const;

export const OFFICIAL_GOVERNORATE_NAMES = EGYPT_GOVERNORATES.map((g) => g.nameAr);

export function findGovernorate(nameOrId: string): GovernorateInfo | undefined {
  return EGYPT_GOVERNORATES.find((g) => g.nameAr === nameOrId || g.id === nameOrId);
}

export function formatWhatsAppIntlUrl(localNumber: string, text?: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const intl = digits.startsWith("20") ? digits : digits.startsWith("0") ? `20${digits.slice(1)}` : `20${digits}`;
  return text ? `https://wa.me/${intl}?text=${encodeURIComponent(text)}` : `https://wa.me/${intl}`;
}

export const DEFAULT_SUPPORT_CONTACTS = {
  whatsappPrimary: "01550802408",
  whatsappSecondary: "01041254010",
  email: "elsayedhasaneisa1@gmail.com",
  facebook: "https://www.facebook.com/share/1HfHwZvxGP/",
  instagram: "https://www.instagram.com/eng.sayedhasan?cplk=MTN0bWJjaGY1d3dobg==",
  tiktok: "https://www.tiktok.com/@eng.sayedhasan",
  telegram: "@sayoda_elgadar",
  telegramUrl: "https://t.me/sayoda_elgadar",
  whatsappCommunity: "https://chat.whatsapp.com/JWTRlLrWI4nFuXFZsN1U0q?s=cl&p=a&iam=2",
};

export type AdminRole = "user" | "support" | "moderator" | "admin" | "super_admin" | "owner";

export const ROLE_RANK: Record<AdminRole, number> = {
  user: 0,
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
  owner: 5,
};

export function hasRoleAccess(userRole: string, minRole: AdminRole): boolean {
  const rank = ROLE_RANK[(userRole as AdminRole) ?? "user"] ?? 0;
  return rank >= ROLE_RANK[minRole];
}

export const ADMIN_ROLES_AR: Record<AdminRole, string> = {
  user: "مستخدم",
  support: "دعم فني",
  moderator: "مشرف محتوى",
  admin: "مدير",
  super_admin: "مدير أعلى",
  owner: "المالك",
};

export const MEMBERSHIP_CODES = ["FREE", "PLUS", "PRO", "VIP"] as const;
export type MembershipCode = (typeof MEMBERSHIP_CODES)[number];

export interface ThemeDefinition {
  id: string;
  nameAr: string;
  descriptionAr: string;
  previewBg: string;
  previewAccent: string;
  previewGold: string;
}

export const DEV_SIGNATURE = '<Developed by ="EL-sayed Hasan™" andPowerd=true/>';
export const DEV_NAME = "EL-sayed Hasan™";

export const YAWMAK_THEMES: readonly ThemeDefinition[] = [
  { id: "light", nameAr: "أبيض مؤسسي", descriptionAr: "واجهة نظيفة للعمل اليومي", previewBg: "#FFFFFF", previewAccent: "#168653", previewGold: "#168653" },
  { id: "dark", nameAr: "ليل هادئ", descriptionAr: "وضع داكن مريح", previewBg: "#101B17", previewAccent: "#4AB987", previewGold: "#D8B96C" },
  { id: "system", nameAr: "حسب الجهاز", descriptionAr: "يتبع إعدادات جهازك", previewBg: "#EEF4F0", previewAccent: "#168653", previewGold: "#168653" },
  { id: "royal", nameAr: "ملكي ذهبي", descriptionAr: "فحمي ولمسات ذهبية", previewBg: "#171512", previewAccent: "#C7A45A", previewGold: "#D8BC7A" },
  { id: "ocean", nameAr: "المحيط", descriptionAr: "أزرق عميق وهادئ", previewBg: "#EFF6FB", previewAccent: "#2676A8", previewGold: "#2676A8" },
  { id: "lavender", nameAr: "لافندر", descriptionAr: "بنفسجي هادئ", previewBg: "#F6F2FA", previewAccent: "#8063A8", previewGold: "#8063A8" },
  { id: "sand", nameAr: "رمال", descriptionAr: "درجات رملية دافئة", previewBg: "#F7F2E9", previewAccent: "#9B7446", previewGold: "#9B7446" },
  { id: "forest", nameAr: "الغابة", descriptionAr: "أخضر طبيعي عميق", previewBg: "#EFF5EF", previewAccent: "#376B4C", previewGold: "#376B4C" },
  { id: "rose", nameAr: "وردي هادئ", descriptionAr: "وردي ناعم ومتزن", previewBg: "#FBF1F3", previewAccent: "#B65E78", previewGold: "#B65E78" },
  { id: "midnight", nameAr: "منتصف الليل", descriptionAr: "داكن أزرق بلمسات سماوية", previewBg: "#101827", previewAccent: "#62A8D8", previewGold: "#62A8D8" },
] as const;

export const INVITATION_TYPES = [
  { id: "quran", label: "القرآن الكريم", mood: "نور وهداية" },
  { id: "adhkar", label: "الأذكار", mood: "سكينة وطمأنينة" },
  { id: "khatma", label: "الختمات", mood: "تدبر ومداومة" },
  { id: "charity", label: "الأعمال الخيرية", mood: "عطاء وامتداد" },
  { id: "occasion", label: "المناسبات", mood: "بهجة معتدلة" },
  { id: "personal", label: "الدعوات الشخصية", mood: "دفء وقرب" },
  { id: "campaign", label: "الحملات", mood: "تعاون وحركة" },
  { id: "mourning", label: "على روح فقيد", mood: "وقار وسكينة" },
  { id: "wedding_attendance", label: "دعوة حضور حفل زفاف", mood: "افتتاحية ذهبية" },
  { id: "wedding_congrats", label: "تهنئة زفاف", mood: "احتفال ذهبي" },
  { id: "birthday", label: "أعياد الميلاد", mood: "بهجة ودفء" },
  { id: "congrats", label: "تهنئة عامة", mood: "فرح راقٍ" },
] as const;

export const MOURNING_INVITATION_TYPE = "mourning";

export const INVITATION_TEMPLATES = [
  { id: "emerald-royal", name: "الزمرد الملكي", bg: "linear-gradient(135deg, #FAF3E3 0%, #0D3B2C 55%, #050C0A 100%)", border: "#B89545", minPlan: "FREE" },
  { id: "midnight-gold", name: "نور الهلال الذهبي", bg: "linear-gradient(135deg, #050708 0%, #17140A 55%, #060908 100%)", border: "#B89545", minPlan: "FREE" },
  { id: "ivory-mosque", name: "رخام المسجد", bg: "linear-gradient(135deg, #F5EFE2 0%, #E7DBC1 100%)", border: "#9E7818", minPlan: "PLUS" },
  { id: "andalusian-night", name: "ليلة أندلسية", bg: "linear-gradient(135deg, #08121E 0%, #0E2B3D 55%, #040910 100%)", border: "#B89545", minPlan: "PLUS" },
  { id: "kaaba-kiswah", name: "كسوة فاخرة", bg: "radial-gradient(circle at top, #221B09 0%, #050606 70%)", border: "#F2D06B", minPlan: "PRO" },
  { id: "qurtuba-arch", name: "قوس قرطبة", bg: "linear-gradient(160deg, #13091F 0%, #24133D 50%, #07050D 100%)", border: "#E6C465", minPlan: "PRO" },
  {
    id: "sakina-memory",
    name: "سكينة ووقار",
    bg: "linear-gradient(165deg, #0A100E 0%, #12211C 55%, #070B0A 100%)",
    border: "#D4AF62",
    minPlan: "FREE",
  },
] as const;

export const MOURNING_TEMPLATE_ID = "sakina-memory";

export const BAN_REASONS = [
  "انتهاك الخصوصية",
  "نشر بيانات شخصية دون إذن",
  "انتحال الهوية",
  "التحرش",
  "الاحتيال",
  "إساءة استخدام المنصة",
  "المحتوى المخالف",
] as const;

export const APP_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://yawmak.islamic.app";
