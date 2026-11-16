import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import { db } from "@/db";
import { rateLimitBuckets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const original = Buffer.from(originalHex, "hex");
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateSlug(base: string): string {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 28);
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${clean || "yawmak"}-${suffix}`;
}

export function getClientFingerprint(req: Request, secondaryKey = ""): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ua = req.headers.get("user-agent")?.slice(0, 80) || "unknown";
  return sha256Hex(`${forwarded}|${ua}|${secondaryKey}`).slice(0, 32);
}

export async function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const existing = await db
      .select()
      .from(rateLimitBuckets)
      .where(eq(rateLimitBuckets.key, bucketKey))
      .limit(1);

    if (existing.length === 0 || existing[0].resetAt <= now) {
      await db
        .insert(rateLimitBuckets)
        .values({ key: bucketKey, count: 1, resetAt })
        .onConflictDoUpdate({
          target: rateLimitBuckets.key,
          set: { count: 1, resetAt },
        });
      return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
    }

    const current = existing[0];
    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    await db
      .update(rateLimitBuckets)
      .set({ count: sql`${rateLimitBuckets.count} + 1` })
      .where(eq(rateLimitBuckets.key, bucketKey));

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - (current.count + 1)),
      retryAfterSeconds: 0,
    };
  } catch {
    return { allowed: true, remaining: 1, retryAfterSeconds: 0 };
  }
}

export function isPrivateOrReservedIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // Cloud metadata / link-local
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true;
    return false;
  }

  const normalized = ip.toLowerCase();
  if (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:169.254.") ||
    normalized.startsWith("::ffff:192.168.")
  ) {
    return true;
  }
  return false;
}

const ALLOWED_OG_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const MAX_OG_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function validateExternalOgImageUrl(rawUrl: string): Promise<{
  ok: boolean;
  error?: string;
  contentType?: string;
  fileSizeBytes?: number;
}> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "صيغة رابط الصورة غير صالحة" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "يجب استخدام روابط HTTPS فقط لصور Open Graph" };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    return { ok: false, error: "النطاق غير مسموح به لأسباب أمنية (SSRF Protection)" };
  }

  if (net.isIP(hostname) && isPrivateOrReservedIp(hostname)) {
    return { ok: false, error: "عناوين الشبكة الداخلية غير مسموحة" };
  }

  try {
    const records = await dns.lookup(hostname, { all: true });
    if (!records.length) {
      return { ok: false, error: "تعذر التحقق من نطاق الصورة" };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return { ok: false, error: "تم رفض الرابط لأنه يشير إلى عنوان داخلي محمي" };
      }
    }
  } catch {
    return { ok: false, error: "تعذر الوصول إلى النطاق المحدد" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(parsed.toString(), {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status >= 300 && res.status < 400) {
      return { ok: false, error: "الروابط المعاد توجيهها غير مسموحة — استخدم رابط الصورة المباشر" };
    }

    if (!res.ok) {
      return { ok: false, error: "لم يستجب رابط الصورة بشكل صحيح" };
    }

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_OG_CONTENT_TYPES.has(contentType)) {
      return {
        ok: false,
        error: "يجب أن تكون الصورة بصيغة PNG أو JPG أو WebP (صور SVG غير مدعومة لمعاينات Open Graph)",
      };
    }

    const lenHeader = res.headers.get("content-length");
    const fileSizeBytes = lenHeader ? parseInt(lenHeader, 10) : 0;
    if (fileSizeBytes > MAX_OG_IMAGE_BYTES) {
      return { ok: false, error: "حجم الصورة يتجاوز الحد الأقصى المسموح (5 ميجابايت)" };
    }

    return { ok: true, contentType, fileSizeBytes: Number.isFinite(fileSizeBytes) ? fileSizeBytes : 0 };
  } catch {
    clearTimeout(timeout);
    return { ok: false, error: "انتهت مهلة التحقق من رابط الصورة أو تعذر الوصول إليه" };
  }
}

export function safeRedirectPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return fallback;
  return raw;
}

export function parseUserAgentMeta(ua: string | null): { os: string; browser: string } {
  const s = ua || "";
  let os = "Other";
  if (/android/i.test(s)) os = "Android";
  else if (/iphone|ipad|ipod|ios/i.test(s)) os = "iOS";
  else if (/windows/i.test(s)) os = "Windows";
  else if (/macintosh|mac os/i.test(s)) os = "macOS";
  else if (/linux/i.test(s)) os = "Linux";

  let browser = "Other";
  if (/edg\//i.test(s)) browser = "Edge";
  else if (/firefox|fxios/i.test(s)) browser = "Firefox";
  else if (/chrome|crios/i.test(s) && !/edg\//i.test(s)) browser = "Chrome";
  else if (/safari/i.test(s) && !/chrome|crios/i.test(s)) browser = "Safari";

  return { os, browser };
}
