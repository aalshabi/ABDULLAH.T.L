import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { LEGAL_CONTENT } from "@/components/legal-page";
import { isPublicBetaFeedbackEnabled, isServerBetaFeedbackEnabled } from "@/lib/feedback/config";
import { KNOWN_REGRESSION_GAPS } from "@/lib/offer-pipeline/regression/load-fixtures";
import { SAFRBWAI_URL } from "@/lib/result-actions/format-questions";
import { DEMO_ROBOTS, SITE_DESCRIPTION } from "@/lib/seo";

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function legalText(doc: "privacy" | "terms", locale: "ar" | "en"): string {
  return LEGAL_CONTENT[doc][locale].map(({ h, p }) => `${h} ${p}`).join(" ");
}

const readme = readSource("README.md");
const privacyAr = legalText("privacy", "ar");
const privacyEn = legalText("privacy", "en");
const termsAr = legalText("terms", "ar");
const termsEn = legalText("terms", "en");

describe("current closed Beta product integrity", () => {
  it("describes a text-only closed Beta without claiming AI, scoring, or inactive tools", () => {
    expect(readme).toContain("سافر بوعي أداة تجريبية");
    expect(readme).toContain(
      "SafrBwai is an experimental tool that helps travelers review the information stated in a text travel offer before booking."
    );
    expect(readme).toContain("Text analysis only.");
    expect(readme).toContain("Deterministic rule-based analysis.");
    expect(readme).toContain("No AI or LLM.");
    expect(readme).toContain("PDF files, images, and links are not supported.");
    expect(readme).toContain("Closed Beta");
    expect(readme).toContain("Results are advisory");

    for (const unsupportedClaim of [
      "AI travel-intelligence platform",
      "منصة الذكاء الاصطناعي",
      "trust score",
      "Swapping in a real AI backend",
      "**Analyze Hotel**",
      "**Analyze Destination**",
      "**Compare Hotels**",
      "saved analyses",
    ]) {
      expect(readme).not.toContain(unsupportedClaim);
    }
  });

  it("keeps the privacy draft aligned with the current Arabic and English Beta flow", () => {
    expect(privacyAr).toContain("لا يوجد تسجيل دخول أو حسابات مستخدمين مفعّلة");
    expect(privacyEn).toContain("Sign-in and user accounts are not enabled");
    expect(privacyAr).toContain("رفع ملفات PDF أو الصور وتحليل الروابط غير مدعوم");
    expect(privacyEn).toContain("PDF uploads, image uploads, and link analysis are not currently supported");
    expect(privacyAr).toContain("يُرسل نص العرض إلى API التحليل");
    expect(privacyEn).toContain("the offer text is sent to the analysis API");
    expect(privacyAr).toContain("لا يحفظ التطبيق نص العرض أو نتيجة التحليل في قاعدة بيانات");
    expect(privacyEn).toContain("does not store the offer text or analysis result in a database");
    expect(privacyAr).toContain("لا يُسجل نص العرض أو الدليل المختصر");
    expect(privacyEn).toContain("does not log the offer text or short evidence");
    expect(privacyAr).toContain("لا يدخل هذا الدليل في نص نسخ الأسئلة أو الملخص");
    expect(privacyEn).toContain("excluded from copied questions and summaries");
    expect(privacyAr).toContain("Feedback غير مفعّل ولا يُسجل");
    expect(privacyEn).toContain("Feedback is not enabled and is not recorded");
    expect(privacyAr).toContain("تفضيلات اللغة والمظهر");
    expect(privacyEn).toContain("Language and theme preferences");

    for (const removedClaim of [
      "Supabase",
      "مزوّد المصادقة",
      "When you sign up",
      "Files you upload",
      "قد ترفع ملفات",
      "analysis history is currently stored locally",
      "سجلّ تحليلاتك يُخزَّن",
      "lifetime of your account",
      "طوال فعالية حسابك",
    ]) {
      expect(`${privacyAr} ${privacyEn}`).not.toContain(removedClaim);
    }
  });

  it("keeps the terms advisory and removes booking, payment, and external referral claims", () => {
    expect(termsAr).toContain("تحلل النص الذي يقدمه المستخدم فقط");
    expect(termsEn).toContain("analyzes only the text provided by the user");
    expect(termsAr).toContain("لا تتحقق سافر بوعي من هوية البائع");
    expect(termsEn).toContain("does not verify the seller’s identity");
    expect(termsAr).toContain("لا تنفذ سافر بوعي حجزًا أو دفعًا");
    expect(termsEn).toContain("does not make bookings or process payments");
    expect(termsAr).toContain("التحقق من المصدر الرسمي");
    expect(termsEn).toContain("Verify with the official source");
    expect(termsAr).toContain("لا تُدخل بيانات شخصية أو معلومات دفع");
    expect(termsEn).toContain("Do not enter personal or payment information");

    for (const removedClaim of [
      "العلاقة مع",
      "قد نوجّهك",
      "Relationship with",
      "when you wish to book we may refer",
      "separate fulfillment party",
      "external fulfillment party",
      "جهة تنفيذ خارجية",
    ]) {
      expect(`${termsAr} ${termsEn}`).not.toContain(removedClaim);
    }
  });

  it("uses accurate SafrBwai metadata, manifest, and JSON-LD descriptions", () => {
    const metadataSources = [
      readSource("src/app/layout.tsx"),
      readSource("src/app/manifest.ts"),
      readSource("src/app/page.tsx"),
      readSource("src/lib/seo.ts"),
    ].join("\n");
    const appManifest = manifest();

    expect(metadataSources).toContain("SafrBwai");
    expect(metadataSources).toContain("text travel offers");
    expect(SITE_DESCRIPTION).toContain("تحليل عروض السفر النصية");
    expect(appManifest.name).toBe("سافر بوعي — SafrBwai");
    expect(appManifest.description).toContain("عروض السفر النصية");
    expect(metadataSources).not.toContain("ذكاء اصطناعي");
    expect(metadataSources.toLowerCase()).not.toMatch(/\bai\b/);
    expect(metadataSources.toLowerCase()).not.toContain("scoring");
    expect(metadataSources.toLowerCase()).not.toContain("review hotels, destinations");
  });

  it("preserves the site URL, noindex controls, disabled feedback, and zero known gaps", () => {
    expect(SAFRBWAI_URL).toBe("https://www.safrbwai.com");
    expect(DEMO_ROBOTS).toEqual({ index: false, follow: false });
    expect(isPublicBetaFeedbackEnabled("false")).toBe(false);
    expect(isServerBetaFeedbackEnabled("false")).toBe(false);
    expect(KNOWN_REGRESSION_GAPS).toEqual({});
  });

  it("keeps account entry points disabled across navigation, CTA, and the auth page", () => {
    const navbarSource = readSource("src/components/layout/navbar.tsx");
    const ctaSource = readSource("src/components/home/cta.tsx");
    const authPageSource = readSource("src/app/auth/page.tsx");
    const unavailableSource = readSource("src/components/auth-unavailable.tsx");

    expect(navbarSource).not.toContain('href="/auth"');
    expect(navbarSource).not.toContain('href="/auth?mode=signup"');
    expect(ctaSource).toContain('href="/analyze-offer"');
    expect(ctaSource).not.toContain("/auth");
    expect(authPageSource).toContain("AuthUnavailable");
    expect(authPageSource).not.toContain("AuthForm");
    expect(unavailableSource).not.toMatch(/supabase|createClient|fetch\s*\(|<form/i);
  });
});
