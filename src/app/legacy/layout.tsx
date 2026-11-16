import type { Metadata } from "next";
import { APP_SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "الأثر والذكرى",
  description: "مساحة لحفظ الأثر الطيب والذكرى والدعاء.",
  openGraph: {
    title: "الأثر والذكرى | YAWMAK",
    description: "مساحة لحفظ الأثر الطيب والذكرى والدعاء.",
    url: `${APP_SITE_URL}/legacy`,
    images: [{ url: "/images/og-memorial.png", width: 1024, height: 1024, alt: "YAWMAK — الأثر والذكرى" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-memorial.png"],
  },
};

export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
