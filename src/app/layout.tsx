import type { Metadata, Viewport } from "next";
import { Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

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
    default: "سافر بوعي — Safer Bewae | منصة الذكاء الاصطناعي للسفر",
    template: "%s | سافر بوعي",
  },
  description:
    "منصة ذكاء اصطناعي تكشف خدع الفنادق والوجهات والعروض السياحية قبل أن تدفع. حلّل، قارن، واحجز بوعي. An AI travel intelligence platform.",
  keywords: [
    "سافر بوعي",
    "Safer Bewae",
    "تحليل الفنادق",
    "خدع السفر",
    "مقارنة الفنادق",
    "travel AI",
    "hotel analysis",
    "travel scams",
    "conscious travel",
  ],
  authors: [{ name: "Abdullah Travel Lab" }],
  creator: "Abdullah Travel Lab",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: SITE_URL,
    title: "سافر بوعي — Safer Bewae",
    description: "منصة ذكاء اصطناعي تكشف خدع السفر قبل أن تدفع.",
    siteName: "Safer Bewae",
  },
  twitter: {
    card: "summary_large_image",
    title: "سافر بوعي — Safer Bewae",
    description: "منصة ذكاء اصطناعي تكشف خدع السفر قبل أن تدفع.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
