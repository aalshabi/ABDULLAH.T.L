import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سافر بوعي — SafrBwai",
    short_name: "سافر بوعي",
    description: "أداة تساعدك على مراجعة المعلومات الواردة في عروض السفر واتخاذ قرار أوضح قبل الحجز.",
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
