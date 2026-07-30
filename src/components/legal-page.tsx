"use client";

import { AlertTriangle, ScrollText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { PageHeader } from "@/components/shared/page-header";

type Doc = "privacy" | "terms";
type Section = { h: string; p: string };

const DRAFT_NOTICE = {
  ar: "مسودة أولية تحتاج مراجعة قانونية قبل الإطلاق التجاري.",
  en: "Preliminary draft — requires legal review before commercial launch.",
};

const TITLES: Record<Doc, { ar: string; en: string }> = {
  privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  terms: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
};

export const LEGAL_CONTENT: Record<Doc, Record<"ar" | "en", Section[]>> = {
  privacy: {
    ar: [
      {
        h: "نطاق الـBeta الحالية",
        p: "سافر بوعي أداة تجريبية مغلقة لتحليل عروض السفر النصية. لا يوجد تسجيل دخول أو حسابات مستخدمين مفعّلة في تدفق الـBeta الحالي.",
      },
      {
        h: "المصادر المدعومة",
        p: "تدعم الواجهة تحليل النص فقط. رفع ملفات PDF أو الصور وتحليل الروابط غير مدعوم حاليًا، ولا تُرسل هذه المصادر إلى API التحليل.",
      },
      {
        h: "معالجة نص العرض",
        p: "عند طلب التحليل، يُرسل نص العرض إلى API التحليل لتنفيذ الطلب بواسطة محرك حتمي قائم على قواعد، دون AI أو LLM.",
      },
      {
        h: "التخزين والتسجيل",
        p: "لا يحفظ التطبيق نص العرض أو نتيجة التحليل في قاعدة بيانات، ولا يُسجل نص العرض أو الدليل المختصر في سجلات التشغيل.",
      },
      {
        h: "الدليل والنسخ",
        p: "قد يظهر دليل مختصر مأخوذ من نص العرض داخل نتيجة التحليل الحالية. لا يدخل هذا الدليل في نص نسخ الأسئلة أو الملخص، ولا يُخزّن.",
      },
      {
        h: "معرّف الطلب",
        p: "قد يظهر Request ID عند بعض أخطاء التطبيق لأغراض الدعم. لا يتضمن معرّف الطلب نص العرض أو الدليل.",
      },
      {
        h: "الملاحظات والتحليلات",
        p: "Feedback غير مفعّل ولا يُسجل. لا يستخدم التطبيق حاليًا Analytics أو أدوات تتبع تسويقي.",
      },
      {
        h: "تفضيلات المتصفح",
        p: "قد تبقى تفضيلات اللغة والمظهر محليًا في متصفحك لتطبيق اختيارك عند الزيارات اللاحقة.",
      },
      {
        h: "سلامة الإدخال",
        p: "لا تُدخل بيانات شخصية أو معلومات دفع ضمن نص العرض. استخدم نصًا غير حساس أو مجهّلًا.",
      },
    ],
    en: [
      {
        h: "Current Beta scope",
        p: "SafrBwai is a closed experimental tool for analyzing text travel offers. Sign-in and user accounts are not enabled in the current Beta flow.",
      },
      {
        h: "Supported sources",
        p: "The interface supports text analysis only. PDF uploads, image uploads, and link analysis are not currently supported, and those sources are not sent to the analysis API.",
      },
      {
        h: "Offer-text processing",
        p: "When analysis is requested, the offer text is sent to the analysis API and processed by a deterministic rule-based engine, without AI or an LLM.",
      },
      {
        h: "Storage and logging",
        p: "The application does not store the offer text or analysis result in a database, and it does not log the offer text or short evidence in operational logs.",
      },
      {
        h: "Evidence and copied output",
        p: "Short evidence taken from the offer text may appear in the current analysis result. It is excluded from copied questions and summaries and is not stored.",
      },
      {
        h: "Request ID",
        p: "A Request ID may appear for some application errors to support troubleshooting. The identifier does not contain the offer text or evidence.",
      },
      {
        h: "Feedback and analytics",
        p: "Feedback is not enabled and is not recorded. The application currently uses no analytics or marketing tracking tools.",
      },
      {
        h: "Browser preferences",
        p: "Language and theme preferences may remain locally in your browser so the application can remember your choices.",
      },
      {
        h: "Input safety",
        p: "Do not enter personal or payment information in the offer text. Use non-sensitive or anonymized text.",
      },
    ],
  },
  terms: {
    ar: [
      {
        h: "طبيعة الخدمة",
        p: "سافر بوعي أداة استشارية وتجريبية تحلل النص الذي يقدمه المستخدم فقط. النتائج تساعد على مراجعة المعلومات المذكورة ولا تمثّل نصيحة نهائية أو ضمانًا.",
      },
      {
        h: "نطاق الخدمة الحالي",
        p: "تحليل النص هو المصدر الوحيد المدعوم في الـBeta الحالية. ملفات PDF والصور والروابط وميزات الحسابات غير مفعّلة.",
      },
      {
        h: "التحقق من البائع",
        p: "لا تتحقق سافر بوعي من هوية البائع أو صفته أو قدرته على تنفيذ العرض.",
      },
      {
        h: "لا حجز أو دفع",
        p: "لا تنفذ سافر بوعي حجزًا أو دفعًا. يجب التحقق من المصدر الرسمي قبل أي حجز أو التزام مالي.",
      },
      {
        h: "لا ضمان للسعر أو العرض",
        p: "لا نضمن دقة السعر أو التوفّر أو السياسات أو صحة العرض. قد تكون المعلومات ناقصة أو متغيرة، والنتائج استشارية فقط.",
      },
      {
        h: "سلامة الإدخال",
        p: "لا تُدخل بيانات شخصية أو معلومات دفع. استخدم نصًا غير حساس أو مجهّلًا عند تجربة الخدمة.",
      },
      {
        h: "الاستخدام المقبول",
        p: "توافق على عدم إساءة استخدام الخدمة أو تقديم محتوى غير قانوني أو ضار أو منتهك لحقوق الغير.",
      },
      {
        h: "الملكية الفكرية",
        p: "جميع حقوق الخدمة وتصميمها ومحتواها محفوظة، ولا يجوز إعادة استخدامها دون إذن.",
      },
      {
        h: "حدود المسؤولية",
        p: "تُقدَّم الخدمة «كما هي» دون ضمانات. لا نتحمّل مسؤولية قرار سفر أو خسارة تنتج عن الاعتماد على النتائج التجريبية.",
      },
      {
        h: "التعديلات",
        p: "قد نحدّث هذه الشروط أو الخدمة، ويظهر أي تحديث عند نشره.",
      },
    ],
    en: [
      {
        h: "Nature of the service",
        p: "SafrBwai is an advisory experimental tool that analyzes only the text provided by the user. Results help review the stated information and do not constitute final advice or a guarantee.",
      },
      {
        h: "Current service scope",
        p: "Text analysis is the only supported source in the current Beta. PDF files, images, links, and account features are not enabled.",
      },
      {
        h: "Seller verification",
        p: "SafrBwai does not verify the seller’s identity, status, or ability to fulfill the offer.",
      },
      {
        h: "No booking or payment",
        p: "SafrBwai does not make bookings or process payments. Verify with the official source before booking or making a financial commitment.",
      },
      {
        h: "No price or offer guarantee",
        p: "We do not guarantee the accuracy of a price, availability, policy, or offer. Information may be incomplete or change, and results are advisory only.",
      },
      {
        h: "Input safety",
        p: "Do not enter personal or payment information. Use non-sensitive or anonymized text when trying the service.",
      },
      {
        h: "Acceptable use",
        p: "You agree not to misuse the service or submit unlawful, harmful, or rights-infringing content.",
      },
      {
        h: "Intellectual property",
        p: "All service rights, design, and content are reserved and may not be reused without permission.",
      },
      {
        h: "Limitation of liability",
        p: "The service is provided \"as is\" without warranties. We are not liable for a travel decision or loss arising from reliance on experimental results.",
      },
      {
        h: "Changes",
        p: "We may update these terms or the service, and any update appears when published.",
      },
    ],
  },
};

export function LegalPage({ doc }: { doc: Doc }) {
  const { locale } = useLanguage();
  const title = TITLES[doc][locale];
  const sections = LEGAL_CONTENT[doc][locale];

  return (
    <>
      <PageHeader icon={ScrollText} title={title} subtitle="" />
      <div className="container -mt-8 pb-20">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <span>{DRAFT_NOTICE[locale]}</span>
          </div>

          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
            {sections.map((s, i) => (
              <section key={i} className="space-y-1.5">
                <h2 className="font-display text-lg font-bold text-foreground">
                  <span className="ltr-nums text-teal">{i + 1}.</span> {s.h}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
