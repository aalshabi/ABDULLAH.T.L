import { Hero } from "@/components/home/hero";
import { Benefits } from "@/components/home/benefits";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Pillars } from "@/components/home/pillars";
import { CTA } from "@/components/home/cta";

// Neutral structured data for the experimental text-analysis tool.
const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SafrBwai — سافر بوعي",
  description:
    "An experimental rule-based tool that helps travelers review information stated in text travel offers before booking.",
  inLanguage: ["ar", "en"],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
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
