import { notFound } from "next/navigation";
import AdminControlCenter, { type AdminSectionId } from "@/components/admin/AdminControlCenter";

const VALID_SECTIONS = new Set<AdminSectionId>([
  "users",
  "memberships",
  "payments",
  "verifications",
  "invitations",
  "campaigns",
  "communities",
  "moderation",
  "reports",
  "visitors",
  "geography",
  "database",
  "api-health",
  "support",
  "content",
  "announcements",
  "settings",
  "audit-logs",
]);

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!VALID_SECTIONS.has(section as AdminSectionId)) {
    notFound();
  }
  return <AdminControlCenter section={section as AdminSectionId} />;
}
