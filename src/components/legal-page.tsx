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

const CONTENT: Record<Doc, Record<"ar" | "en", Section[]>> = {
  privacy: {
    ar: [
      { h: "منتج تجريبي", p: "سافر بوعي منصة تجريبية قيد التطوير. النتائج والتحليلات المعروضة حاليًا مولّدة لأغراض عرض تجربة المستخدم ولا تعتمد على بيانات حقيقية أو مصادر خارجية." },
      { h: "بيانات الحساب", p: "عند التسجيل قد نعالج بريدك الإلكتروني واسمك ومعرّف الحساب عبر مزوّد المصادقة (Supabase) لإنشاء حسابك وتأمين الدخول." },
      { h: "الملفات التي ترفعها", p: "قد ترفع ملفات (PDF أو صور) لأغراض العرض. في النسخة الحالية لا يقرأ النظام محتوى الملف ولا ينفّذ استخراجًا، وتبقى الملفات في متصفحك ولا تُرفع إلى خوادمنا." },
      { h: "التحليلات", p: "سجلّ تحليلاتك يُخزَّن حاليًا محليًا في متصفحك (Local Storage) وهو مؤقت، وسيُربط بحسابك عند تفعيل قاعدة البيانات مستقبلًا." },
      { h: "ملفات الارتباط", p: "نستخدم ملفات ارتباط ضرورية لإدارة الجلسة وتفضيلات اللغة والمظهر. لا نستخدم حاليًا أدوات تتبّع تسويقية." },
      { h: "مزوّدو الخدمات", p: "قد نعتمد على مزوّدين مثل Supabase (المصادقة) واستضافة السحابة. تخضع بياناتك لسياساتهم إضافةً إلى سياستنا." },
      { h: "مدة الاحتفاظ", p: "نحتفظ ببيانات الحساب طوال فعالية حسابك. البيانات المحلية في متصفحك يمكنك حذفها في أي وقت من لوحة التحكم أو بمسح تخزين المتصفح." },
      { h: "حقوق المستخدم", p: "لك حق الوصول إلى بياناتك وتصحيحها وحذفها والاعتراض على معالجتها، بما يتوافق مع الأنظمة المعمول بها (مثل نظام حماية البيانات الشخصية في السعودية)." },
      { h: "وسيلة التواصل", p: "لأي استفسار حول الخصوصية أو لطلب حذف بياناتك، تواصل معنا عبر قنوات التواصل المعلنة في المنصة." },
    ],
    en: [
      { h: "Experimental product", p: "SafrBwai is an experimental platform under development. The results shown are generated to demonstrate the user experience and are not currently based on real data or external sources." },
      { h: "Account data", p: "When you sign up we may process your email, name and account ID via our authentication provider (Supabase) to create your account and secure sign-in." },
      { h: "Files you upload", p: "You may upload files (PDF or images) for demonstration. In the current version the system does not read file content or perform extraction; files stay in your browser and are not uploaded to our servers." },
      { h: "Analyses", p: "Your analysis history is currently stored locally in your browser (Local Storage) and is temporary; it will be linked to your account once the database is enabled." },
      { h: "Cookies", p: "We use essential cookies for session, language and theme preferences. We do not currently use marketing tracking tools." },
      { h: "Service providers", p: "We may rely on providers such as Supabase (authentication) and cloud hosting. Your data is also subject to their policies alongside ours." },
      { h: "Retention", p: "We retain account data for the lifetime of your account. Local browser data can be deleted at any time from the dashboard or by clearing your browser storage." },
      { h: "Your rights", p: "You have the right to access, correct, delete and object to the processing of your data, in line with applicable regulations (e.g. Saudi PDPL)." },
      { h: "Contact", p: "For privacy questions or deletion requests, contact us through the channels published on the platform." },
    ],
  },
  terms: {
    ar: [
      { h: "طبيعة الخدمة", p: "سافر بوعي أداة استشارية وتعليمية تساعدك على التفكير قبل الحجز. المحتوى الحالي تجريبي ولا يمثّل نصيحة نهائية أو ضمانًا." },
      { h: "لا ضمان للسعر أو التوفّر", p: "لا نضمن دقة أي سعر أو توفّر أو سياسة. النتائج استشارية وقد تتغيّر، ويجب عليك التحقق من المصدر الرسمي قبل أي التزام مالي." },
      { h: "العلاقة مع Sky Global Holidays", p: "سافر بوعي جهة تحليل محايدة؛ وعند رغبتك في تنفيذ حجز قد نوجّهك إلى Sky Global Holidays كجهة تنفيذ منفصلة. لا يؤثّر ذلك على حياد التحليل، وأي حجز يخضع لشروط تلك الجهة." },
      { h: "الاستخدام المقبول", p: "توافق على عدم إساءة استخدام المنصة أو رفع محتوى غير قانوني أو ضار أو انتهاك حقوق الغير." },
      { h: "الملكية الفكرية", p: "جميع حقوق المنصة وتصميمها ومحتواها محفوظة، ولا يجوز إعادة استخدامها دون إذن." },
      { h: "حدود المسؤولية", p: "تُقدَّم الخدمة «كما هي» دون ضمانات. لا نتحمّل مسؤولية أي قرار سفر أو خسارة تنتج عن الاعتماد على النتائج التجريبية." },
      { h: "التعديلات", p: "قد نحدّث هذه الشروط أو الخدمة في أي وقت، ويسري التحديث فور نشره." },
      { h: "التواصل", p: "لأي استفسار حول الشروط، تواصل معنا عبر القنوات المعلنة في المنصة." },
    ],
    en: [
      { h: "Nature of the service", p: "SafrBwai is an advisory and educational tool to help you think before booking. The current content is experimental and does not constitute final advice or a guarantee." },
      { h: "No price or availability guarantee", p: "We do not guarantee the accuracy of any price, availability or policy. Results are advisory and may change; verify with the official source before any financial commitment." },
      { h: "Relationship with Sky Global Holidays", p: "SafrBwai is a neutral analysis party; when you wish to book we may refer you to Sky Global Holidays as a separate fulfillment party. This does not affect analysis neutrality, and any booking is subject to that party's terms." },
      { h: "Acceptable use", p: "You agree not to misuse the platform, upload unlawful or harmful content, or infringe others' rights." },
      { h: "Intellectual property", p: "All platform rights, design and content are reserved and may not be reused without permission." },
      { h: "Limitation of liability", p: "The service is provided \"as is\" without warranties. We are not liable for any travel decision or loss arising from reliance on the experimental results." },
      { h: "Changes", p: "We may update these terms or the service at any time; updates take effect once published." },
      { h: "Contact", p: "For questions about these terms, contact us through the channels published on the platform." },
    ],
  },
};

export function LegalPage({ doc }: { doc: Doc }) {
  const { locale } = useLanguage();
  const title = TITLES[doc][locale];
  const sections = CONTENT[doc][locale];

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
