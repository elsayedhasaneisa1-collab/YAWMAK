import { NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

function svgTemplate(accent: string, soft: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FBF7EC"/>
      <stop offset="55%" stop-color="#FAF8F0"/>
      <stop offset="100%" stop-color="#F4EBD8"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="10%" r="55%">
      <stop offset="0%" stop-color="${soft}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${soft}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="metal" x1="20" y1="18" x2="180" y2="184">
      <stop offset="0%" stop-color="#F2E3B8"/>
      <stop offset="45%" stop-color="#D4AF62"/>
      <stop offset="100%" stop-color="#8D6B2D"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g opacity="0.9">
    <circle cx="600" cy="318" r="188" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.4"/>
    <circle cx="600" cy="318" r="214" fill="none" stroke="${accent}" stroke-opacity="0.16" stroke-width="1"/>
    <rect x="470" y="188" width="260" height="260" rx="70" fill="none" stroke="${accent}" stroke-opacity="0.2" stroke-width="1.2" transform="rotate(45 600 318)"/>
  </g>
  <g transform="translate(500 218) scale(1)" opacity="0.22">
    <path d="M116 26C72 28 40 64 40 106c0 42 32 78 76 80 24 1.2 46-8 62-25-20 26-50 42-82 42-48 0-86-38-86-86 0-40 28-74 66-86 8-2.6 17-4 26-4.6z" fill="url(#metal)"/>
  </g>
  <g fill="${accent}" opacity="0.5">
    ${Array.from({ length: 40 })
      .map((_, i) => {
        const x = 60 + (i % 10) * 118;
        const y = 40 + Math.floor(i / 10) * 140;
        const r = i % 3 === 0 ? 3.2 : 2;
        return `<circle cx="${x}" cy="${y}" r="${r}"/>`;
      })
      .join("")}
  </g>
  <g stroke="${accent}" stroke-opacity="0.5" stroke-width="1.2" fill="none">
    <path d="M40 590h300M860 590h300"/>
    <circle cx="600" cy="590" r="4" fill="${accent}" stroke="none"/>
    <rect x="586" y="576" width="28" height="28" rx="8" transform="rotate(45 600 590)"/>
  </g>
</svg>`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let accent = "#B89545";
  let soft = "#D4AF62";

  try {
    let raw = slug;
    try {
      raw = decodeURIComponent(slug);
    } catch {
      raw = slug;
    }
    const rows = await db
      .select({ themeColor: invitations.themeColor, type: invitations.type })
      .from(invitations)
      .where(eq(invitations.slug, raw))
      .limit(1);
    if (rows.length) {
      accent = rows[0].themeColor || accent;
      if (rows[0].type === "mourning") {
        accent = "#8D6B2D";
        soft = "#C9B072";
      }
    }
  } catch {
    accent = accent;
  }

  try {
    const png = await sharp(Buffer.from(svgTemplate(accent, soft)))
      .png({ compressionLevel: 9 })
      .toBuffer();

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new NextResponse("unavailable", { status: 500 });
  }
}
