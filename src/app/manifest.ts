import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سافر بوعي — Safer Bewae",
    short_name: "سافر بوعي",
    description: "منصة الذكاء الاصطناعي التي تكشف خدع السفر قبل أن تدفع.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D1B3A",
    theme_color: "#0D1B3A",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
