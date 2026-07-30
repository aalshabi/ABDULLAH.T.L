import { Hero } from "@/components/home/hero";
import { Benefits } from "@/components/home/benefits";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pillars } from "@/components/home/pillars";
import { CTA } from "@/components/home/cta";

// Neutral, non-AI, non-claim structured data for the experimental project.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SafrBwai — سافر بوعي",
  description:
    "An experimental project developing tools to help travelers review hotels, destinations and travel offers before booking.",
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
      <Benefits />
      <Features />
      <HowItWorks />
      <Pillars />
      <CTA />
    </>
  );
}
