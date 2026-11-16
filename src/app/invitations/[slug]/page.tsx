import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { invitations, invitationImages, profiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { APP_SITE_URL, INVITATION_TYPES, MOURNING_INVITATION_TYPE } from "@/lib/constants";
import InvitationExperience, { type InvitationView } from "@/components/invitations/InvitationExperience";
import MourningExperience from "@/components/invitations/MourningExperience";
import ExperienceEngine from "@/components/invitations/ExperienceEngine";

export const dynamic = "force-dynamic";

async function loadInvitation(rawSlug: string) {
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    slug = rawSlug;
  }

  const rows = await db
    .select({
      invitation: invitations,
      creatorName: profiles.username,
      creatorBadge: profiles.verificationBadge,
      creatorPlan: profiles.membershipPlan,
      creatorVerified: profiles.verificationStatus,
      ogImageUrl: invitationImages.imageUrl,
      ogImageAlt: invitationImages.altText,
      ogImageActive: invitationImages.isActive,
    })
    .from(invitations)
    .innerJoin(profiles, eq(invitations.userId, profiles.id))
    .leftJoin(invitationImages, eq(invitations.ogImageId, invitationImages.id))
    .where(eq(invitations.slug, slug))
    .limit(1);

  return rows[0] || null;
}

function resolveImage(row: Awaited<ReturnType<typeof loadInvitation>>) {
  if (!row) return `${APP_SITE_URL}/images/og-default.png`;
  const canShowCustom =
    row.ogImageUrl &&
    row.ogImageActive &&
    (row.creatorPlan === "PRO" || row.creatorPlan === "VIP") &&
    row.creatorVerified === "approved";
  if (canShowCustom) return row.ogImageUrl!;
  return row.invitation.type === MOURNING_INVITATION_TYPE
    ? `${APP_SITE_URL}/images/og-memorial.png`
    : `${APP_SITE_URL}/images/og-default.png`;
}

function resolveTitle(row: NonNullable<Awaited<ReturnType<typeof loadInvitation>>>) {
  if (row.invitation.type === MOURNING_INVITATION_TYPE) {
    const name = String((row.invitation.metadata as Record<string, unknown>)?.deceasedName || "الفقيد");
    return `دعاء وذكر لـ ${name} — اجعل له دعاءً لا ينقطع`;
  }
  return row.invitation.title;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadInvitation(slug);

  if (!row || row.invitation.status !== "published") {
    return { title: "دعوة غير متاحة", robots: { index: false, follow: false } };
  }

  const imageUrl = `${APP_SITE_URL}/api/og/${encodeURIComponent(row.invitation.slug)}`;
  const canonical = `${APP_SITE_URL}/invitations/${row.invitation.slug}`;
  const title = resolveTitle(row);
  const description = row.invitation.description.slice(0, 160);
  const typeLabel = INVITATION_TYPES.find((t) => t.id === row.invitation.type)?.label || "دعوة";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    keywords: [typeLabel, "دعوة", "دعاء", "مشاركة"],
  };
}

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await loadInvitation(slug);

  if (!row || row.invitation.status !== "published") {
    notFound();
  }

  await db
    .update(invitations)
    .set({ viewsCount: sql`${invitations.viewsCount} + 1` })
    .where(eq(invitations.id, row.invitation.id));

  const view: InvitationView = {
    id: row.invitation.id,
    slug: row.invitation.slug,
    type: row.invitation.type,
    title: row.invitation.title,
    description: row.invitation.description,
    templateId: row.invitation.templateId,
    themeColor: row.invitation.themeColor,
    fontFamily: row.invitation.fontFamily,
    bgStyle: row.invitation.bgStyle,
    targetUrl: row.invitation.targetUrl,
    metadata: (row.invitation.metadata as Record<string, unknown>) || null,
    viewsCount: row.invitation.viewsCount + 1,
    sharesCount: row.invitation.sharesCount,
    createdAt: row.invitation.createdAt.toISOString(),
    creatorName: row.creatorName,
    creatorBadge: row.creatorBadge,
  };

  if (row.invitation.type === MOURNING_INVITATION_TYPE) {
    return <MourningExperience invitation={view} />;
  }

  if (
    ["wedding_attendance", "wedding_congrats", "birthday", "congrats"].includes(row.invitation.type)
  ) {
    return <ExperienceEngine invitation={view} />;
  }

  return <InvitationExperience invitation={view} />;
}
