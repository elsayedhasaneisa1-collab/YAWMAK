import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { YawmakProvider } from "@/components/providers/YawmakProvider";
import { YawmakShell } from "@/components/layout/YawmakShell";
import { APP_SITE_URL } from "@/lib/constants";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#087A50",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_SITE_URL),
  title: {
    default: "YAWMAK | يومك",
    template: "%s | YAWMAK يومك",
  },
  description:
    "يومك في مكان واحد: مهامك اليومية، جلسات التركيز، وملاحظاتك — بواجهة عربية هادئة وسريعة تعمل على جميع الأجهزة.",
  applicationName: "YAWMAK | يومك",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/app-icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: APP_SITE_URL,
    siteName: "YAWMAK | يومك",
    title: "YAWMAK | يومك",
    description: "مهامك وتركيزك وملاحظاتك في مكان واحد.",
    images: [
      {
        url: "/images/og-default.png",
        width: 1024,
        height: 1024,
        alt: "YAWMAK | يومك",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAWMAK | يومك",
    description: "مهامك وتركيزك وملاحظاتك في مكان واحد.",
    images: ["/images/og-default.png"],
  },
};

const themePreloadScript = `
(function(){
  try {
    var t = localStorage.getItem('yawmak_theme') || 'light';
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-mode', t);
  } catch(e) {}
})();
`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "YAWMAK | يومك",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  inLanguage: "ar",
  url: APP_SITE_URL,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${amiri.variable} ${tajawal.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themePreloadScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        <YawmakProvider>
          <YawmakShell>{children}</YawmakShell>
        </YawmakProvider>
      </body>
    </html>
  );
}
