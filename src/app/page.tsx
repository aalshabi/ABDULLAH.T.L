import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pillars } from "@/components/home/pillars";
import { CTA } from "@/components/home/cta";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Safer Bewae — سافر بوعي",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web",
  description:
    "AI travel intelligence platform that exposes hotel, destination and travel-offer tricks before you pay.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  inLanguage: ["ar", "en"],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pillars />
      <CTA />
    </>
  );
}
