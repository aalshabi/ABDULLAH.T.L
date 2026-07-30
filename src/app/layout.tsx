import type { Metadata, Viewport } from "next";
import { Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DEMO_ROBOTS } from "@/lib/seo";

const display = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "سافر بوعي — SafrBwai | قبل لا تدفع، افهم قرار سفرك",
    template: "%s | سافر بوعي",
  },
  description:
    "سافر بوعي مشروع تجريبي لتطوير أدوات تساعد المسافر على مراجعة الفنادق والوجهات وعروض السفر قبل الحجز. SafrBwai is an experimental project developing tools to help travelers review hotels, destinations and travel offers before booking.",
  keywords: [
    "سافر بوعي",
    "SafrBwai",
    "مراجعة الفنادق",
    "قرار السفر",
    "مقارنة الفنادق",
    "travel decisions",
    "hotel review",
    "conscious travel",
  ],
  authors: [{ name: "Abdullah Travel Lab" }],
  creator: "Abdullah Travel Lab",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: SITE_URL,
    title: "سافر بوعي — SafrBwai",
    description:
      "مشروع تجريبي لأدوات تساعدك على مراجعة قرار سفرك قبل الحجز. An experimental project — under development.",
    siteName: "SafrBwai",
  },
  twitter: {
    card: "summary_large_image",
    title: "سافر بوعي — SafrBwai",
    description:
      "مشروع تجريبي لأدوات تساعدك على مراجعة قرار سفرك قبل الحجز. An experimental project — under development.",
  },
  robots: DEMO_ROBOTS,
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
      en: "/",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1B3A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
