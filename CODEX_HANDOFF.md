# تقرير تسليم مشروع «سافر بوعي» (safrbwai) — إلى Codex

> **الغرض:** وثيقة تسليم كاملة لمتابعة العمل على المشروع. تشرح البنية، الحالة الحالية،
> القواعد الصارمة، وما تبقّى. اقرأها بالكامل قبل أي تعديل.
> آخر تحديث: بعد دمج PR #9 وإنشاء PR #10.

---

## 1. نظرة عامة

- **الاسم التقني للحزمة:** `safer-bewae` (المشروع التسويقي: «سافر بوعي» / Travel Consciously).
- **الفكرة:** منصّة عربية أولاً (RTL) تُحلّل **عروض السفر** بشكل **شفّاف وحتمي (deterministic)** —
  بلا ذكاء اصطناعي ملفّق، بلا درجات وهمية. كل نتيجة مربوطة بدليل (`evidence`) من نص العرض.
- **الحالة:** المسار النصّي (text) يعمل طرفًا لطرف. PDF/صورة/رابط **مُسجَّلة لكن مُعطَّلة**
  (تُعيد 501). المشروع في مرحلة *soft launch* منشور على Vercel.
- **المستخدم/المالك:** عبدالله الشعبي (`aalshabi`).

---

## 2. حزمة التقنية (Tech Stack)

| الطبقة | التقنية |
|-------|---------|
| Framework | **Next.js 15.5.20** (App Router, RSC, `runtime="nodejs"`, `force-dynamic`) |
| اللغة | **TypeScript 5.7** (strict) |
| الواجهة | **React 19**, Tailwind 3.4, Radix UI, framer-motion, lucide-react |
| الاختبارات | **Vitest 3.2.7** + jsdom + @testing-library/react |
| المنصّة | Vercel (مشروع معزول `safrbwai`) |
| IP للـrate-limit | `@vercel/functions` (`ipAddress`) |
| Auth/DB (غير مُفعّل للعروض) | Supabase (`@supabase/ssr`) |

**الأوامر (من `package.json`):**
```bash
npm run dev        # تشغيل محلي
npm run build      # بناء إنتاجي
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
npm test           # vitest run  (حاليًا 202 اختبارًا / 38 ملفًا)
```
> **قاعدة ذهبية:** قبل أي commit شغّل الأربعة: `typecheck` + `lint` + `test` + `build`. يجب أن تمرّ كلها.

---

## 3. بنية المستودع (الأجزاء المهمة)

```
src/
├─ app/                              # صفحات Next.js + الـAPI
│  ├─ analyze-offer/page.tsx         # صفحة تحليل العرض (الميزة الأساسية)
│  ├─ analyze-hotel/ analyze-destination/ compare-hotels/ knowledge/ …
│  ├─ admin/  dashboard/  auth/      # لوحات + مصادقة (Supabase)
│  └─ api/offer/analyze/route.ts     # ★ Route Handler الوحيد (نحيف)
│
├─ components/
│  ├─ analyzers/offer-analyzer.tsx   # ★ حالة/تدفّق واجهة تحليل العرض (429 هنا)
│  └─ offer-input/                   # مكوّنات الإدخال + المراجعة + عرض النتيجة
│     ├─ travel-offer-input-selector.tsx  text/file/image/url-offer-input.tsx
│     ├─ travel-offer-review.tsx           # مراجعة قبل الإرسال
│     └─ offer-analysis-result.tsx         # ★ عرض التحليل (حقائق/قائمة/أسئلة)
│
├─ lib/
│  ├─ offer-input/                   # التحقّق من المدخل (قبل الـpipeline)
│  │  ├─ types.ts                    # TravelOfferInputType, OFFER_LIMITS, أكواد الأخطاء
│  │  └─ validation.ts               # validateText/validateUrl/buildOfferInput/canSubmit
│  │
│  ├─ offer-pipeline/                # ★★ قلب النظام (انظر §4)
│  │
│  └─ i18n/                          # التدويل (عربي مصدر + إنجليزي)
│     ├─ dictionaries.ts             # ar + en (مفاتيح متماثلة إلزاميًا)
│     └─ provider.tsx                # useLanguage() → { t, locale }
│
└─ …
```

**توثيق موجود بالجذر (اقرأه للسياق):**
`CLAUDE.md` (تعليمات المشروع)، `PRODUCTION_ROADMAP.md`، `DEMO_INTEGRITY_REPORT.md`،
`LAUNCH.md`، `TODOS.md`، `COMPETITIVE_ANALYSIS.md`، `EXECUTIVE_SUMMARY.md`.

---

## 4. ★ المعماريّة الأساسية: Offer Pipeline

مسار حتمي نقيّ تحت `src/lib/offer-pipeline/`. **فصل صارم** بين الاستخراج والتحليل:
عند فشل الاستخراج **لا يُنشأ تحليل**.

```
POST /api/offer/analyze
   → validateRequest()          (content-type, حجم، JSON، نوع المصدر)
   → runOfferPipeline(source)   (pipeline.ts — منسِّق نقيّ، بلا HTTP)
        ├─ capability gate       (capabilities.ts: text=true فقط)
        ├─ getExtractor(type).extract(source)   → ExtractionResult
        ├─ normalizeExtraction(...)             (أرقام عربية، عملة، board…)
        └─ analyzeFacts(facts, { text })        → OfferAnalysis
   → outcomeToHttp()             (تحويل النتيجة إلى HTTP + envelope)
```

### 4.1 نموذج البيانات (`types.ts`)
- `Fact<T> = { value: T; evidence: string; confidenceType: "exact" | "inferred" }`
  - **حاليًا "exact" فقط** — لا مسار كود يُنتج "inferred" (الاستدلال مُعطَّل عمدًا).
- `ExtractedOfferFacts` — كل الحقول اختيارية؛ الحقل الغائب **يُحذف ولا يُخترع**:
  `price, currency, destination, nights, travelers, board, flight, baggage, transfer, insurance, visa`.
- `ExtractionResult = { ok:true; facts; warnings } | { ok:false; reason }`.
- `SCHEMA_VERSION = "1.0"` — كل استجابة تحملها.

### 4.2 الاستخراج — Rules Engine (`extractors/`)
- `registry.ts`: `getExtractor(type)`. أنواع pdf/image/url = stubs مُعطَّلة.
- `extractors/text/` = **محرّك قواعد** (`rule-registry.ts` + قواعد مستقلّة):
  `price, currency, nights, board, baggage, travellers, transfers, insurance, visa`.
  - كل قاعدة **محافِظة**: تلتقط فقط المؤكَّد، تُرفق `evidence`، أنماط anchored آمنة من ReDoS.
  - **لا يُلتقط اسم الفندق أو شركة الطيران بـregex فضفاض** — يُترك فارغًا مع `warning`.

### 4.3 التطبيع (`normalize/`)
تحويل الأرقام العربية-الهندية، توحيد العملة، توحيد رمز الوجبة (board)، الأمتعة، إزالة التكرار.
**نقيّ** بلا شبكة/قرص.

### 4.4 التحليل — حقائق فقط (`analysis/`)
`analyzeFacts(facts, options?)` تُجمِّع `OfferAnalysis`:
- `confirmedFacts` — الحقائق المستخرجة مع الدليل.
- `missingFields` — حقول ناقصة مع تصنيف: `required` / `recommended` / `context-dependent`.
- `contradictions` — تعارضات (أسعار متعدّدة، عملات، ليالٍ…) مع `severity`.
- `checklist` — قائمة تحقّق شفّافة (present / missing / conflicting).
- `suggestedQuestions` — **سياقية، مرتّبة بالأولوية، بحد أقصى 5** (انظر §4.5).
- `completeness` — `present / required` على **الحقول الأساسية فقط** (`totalPrice, currency, nights`).

**سجلّ الحقول:** `analysis/required-fields.ts` (`FIELDS`) هو المصدر الأوحد لتعريف الحقول،
تصنيفها، أسئلتها، ودوال الحضور/الدليل.

### 4.5 محرّك الأسئلة السياقية (أحدث تسليم — PR #10)
- `question-context.ts`: يشتقّ **سياقًا للقراءة فقط** من الحقائق + النص (كلمات مفتاحية ar/en).
  **لا يعدّل الحقائق ولا الأدلة إطلاقًا.**
- `questions.ts`: مرشّحون مرتّبون حسب أثر الحجز، مع `priority: high|medium|low`، ترتيب
  high→medium→low، إزالة التكرار حسب المفتاح، وحدّ أقصى 5.
  - أولوية عليا: السعر/الضرائب، استقبال المطار، خاص/مشترك، نوع الغرفة.
  - أولوية متوسطة/دنيا: الوجبات، الأمتعة، الإلغاء، الخدمات غير المشمولة، مواعيد الطيران، رسوم الوصول.
  - **التأشيرة/التأمين لا تظهران بلا سياق** (فقط عند ذكرهما نصًّا)، ولا تدخلان في الاكتمال.
  - لا سؤال عن حقل مؤكَّد بدليل؛ التعارض يُنتج سؤال حسم.

---

## 5. عقد الـAPI (`/api/offer/analyze`)

- **الطريقة:** `POST` فقط، `content-type: application/json`.
- **الغلاف (envelope):** كل استجابة تحمل `ok`, `schemaVersion:"1.0"`, `requestId` (يُولَّد بالخادم), `Cache-Control: no-store`.
- **النجاح 200:** `{ ok:true, data:{ source, extraction:{facts,warnings}, analysis }, meta:{durationMs} }`.
- **الأخطاء:** `{ ok:false, error:{ code, source? } }` — **بلا أي محتوى مستخدم في جسم الخطأ**.

| HTTP | code | الحالة |
|------|------|--------|
| 400 | `INVALID_JSON` / `BAD_REQUEST` | جسم مشوَّه / مدخل غير صالح |
| 413 | `PAYLOAD_TOO_LARGE` | تجاوز `MAX_BODY_BYTES=100000` أو حدّ النص |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content-Type غير `application/json` |
| 422 | `NOT_ANALYZABLE` | نص قصير/غير قابل للاستخراج (بلا `analysis`) |
| 429 | `RATE_LIMIT_EXCEEDED` | تجاوز الحدّ + ترويسة `Retry-After` |
| 501 | `SOURCE_NOT_SUPPORTED` | pdf/image/url (مع `source`) |
| 500 | `INTERNAL_ERROR` | خطأ غير متوقّع |

**Rate limiting** (`api/rate-limit.ts`): نافذة ثابتة في الذاكرة، **10 طلبات / 60 ثانية**
(قابلة للضبط عبر env). مفتاح العميل = `ipAddress(request)` ثم fallback على
`x-vercel-forwarded-for → x-forwarded-for → x-real-ip → "unknown"` (أول قفزة فقط).
> دفاع محلي لكل نسخة، ليس موزّعًا. الطبقة الحقيقية = قاعدة **WAF** على Vercel (انظر §7).

**الواجهة تجاه 429** (`offer-analyzer.tsx`): القرار على **`status===429` فقط** (لا يُقرأ جسم WAF)،
رسالة ar/en، عدّاد **60 ثانية** يمنع إعادة الإرسال، **بلا إعادة تلقائية**، تعديل النص مسموح أثناء الانتظار.

---

## 6. Git: الفروع وسير العمل

- **الفرع الأساسي للتطوير (base):** `claude/demo-integrity-fixes` — **هو فرع النشر الإنتاجي لمشروع Vercel `safrbwai`**.
- **`main`:** لا يُلمس إطلاقًا.
- **نمط العمل:** كل مهمة على فرع `feature/*` مستقلّ → PR إلى `claude/demo-integrity-fixes` → المالك يدمج يدويًا.
- **آخر PRs:** #9 (soft-launch hardening، مدموج) → #10 (`feature/contextual-offer-questions`، مفتوح، `mergeable_state: clean`).
- **هوية Git الإلزامية:** committer/author = `noreply@anthropic.com`.
- **تذييل كل commit:**
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  Claude-Session: <رابط الجلسة>
  ```
- **إذا كان PR الفرع مدموجًا بالفعل:** ابدأ عملاً جديدًا من `claude/demo-integrity-fixes` — لا تُكدّس فوق تاريخ مدموج.

---

## 7. النشر (Vercel)

- **المشروع المعزول:** `safrbwai` (git-connected بـ `aalshabi/ABDULLAH.T.L`)، فرع الإنتاج `claude/demo-integrity-fixes`.
- **قاعدة WAF Rate Limiting** منشورة على `safrbwai`: المسار `/api/offer/analyze`, Method POST, Fixed Window,
  مفتاح IP, **10 طلبات / 60 ثانية → 429**.
- **لا تلمس** المشروع القديم `abdullah-t-l`، ولا تغيّر Domains/Env/Production Branch.
- كل PR يولّد Vercel Preview (تظهر في checks الـPR) — استخدمها للاختبار اليدوي قبل الدمج.

---

## 8. ⛔ القيود الصارمة (لا تتجاوزها)

**لا تُنفّذ إطلاقًا (بلا إذن صريح من المالك):**
- ❌ قراءة PDF / OCR / جلب روابط (URL fetch → خطر SSRF).
- ❌ أي **AI/LLM** أو استدعاء API خارجي في مسار التحليل — النظام **حتمي فقط**.
- ❌ تخزين نص المستخدم / قاعدة بيانات / Supabase للعروض / analytics على محتوى المستخدم.
- ❌ تسجيل (log) نص المستخدم أو `evidence` أو أسماء ملفات أو روابط أو PII.
- ❌ وضع أي محتوى مستخدم في جسم رسائل الخطأ.
- ❌ `dangerouslySetInnerHTML`.
- ❌ تعديل `main`، أو مشروع Vercel `abdullah-t-l`، أو قاعدة WAF/إعدادات Vercel من الكود.
- ❌ إنشاء PR أو **دمج** بلا طلب صريح.

**التزم دائمًا:**
- ✅ إعادة تحقّق خادمية دائمًا، `no-store`، حدود الحجم.
- ✅ كل حقيقة مربوطة بدليل؛ لا اختراع حقول؛ `confidenceType:"exact"` فقط.
- ✅ i18n: أضِف المفتاح لـ `ar` و`en` معًا (اختبار التماثل يكسر غير ذلك).
- ✅ tripwires الأمانة يجب أن تبقى خضراء: `analyzers-integrity.test.ts`, `validation.test.ts`,
  `home-integrity.test.ts`, `dictionaries.test.ts`, وفحوص source-scan في `route.test.ts`.

---

## 9. ما تمّ / ما تبقّى

### ✅ منجز
- إدخال العرض (text/pdf/image/url) + تحقّق + مراجعة (النص فقط مُفعَّل).
- Pipeline نصّي كامل: rules-engine extractor → normalize → facts-analysis.
- Route Handler نحيف + غلاف موحّد + أكواد أخطاء + rate limiting + logging آمن.
- ربط الواجهة بالـAPI الحقيقي، عرض النتيجة (حقائق/قائمة/تعارضات/أسئلة/اكتمال).
- تحصين soft-launch (PR #9) + معالجة 429 والأسئلة السياقية (PR #10).
- WAF منشور، مشروع `safrbwai` منشور ومتحقَّق منه.

### 🔜 مقترحات المتابعة (حسب الأولوية)
1. **اختبار Preview اليدوي لـPR #10** بأربعة نصوص (طيران+فندق بلا مواصلات، عرض محلي،
   تأشيرة غامضة، نص مزدحم) ثم الدمج.
2. **توسيع قواعد الاستخراج**: مواعيد/توقّفات الطيران، نوع الغرفة/الأسرّة، تعدّد المدن،
   الضرائب/الرسوم، سياسة الإلغاء — حاليًا تُلتقط سياقيًا من النص فقط ولا توجد لها حقائق مستخرجة.
   (إضافة كل قاعدة = ملف واحد في `extractors/text/rules/` + تسجيلها؛ بلا لمس النموذج/التطبيع/التحليل/الـroute.)
3. **تفعيل مصدر جديد** (مثلاً URL) = مستخرِج حقيقي + قلب علم القدرة في `capabilities.ts`
   **مع حماية SSRF صارمة** — يتطلب إذنًا صريحًا.
4. تحسينات UX/وصولية على `offer-analysis-result.tsx` (عرض الأولوية بصريًا مثلاً).
5. مراجعة `npm audit` (تحذيران moderate عبر postcss/next — غير قابلين للإصلاح دون كسر next؛ موثّقان).

---

## 10. كيف تبدأ (Codex)

```bash
# 1) انطلق من قاعدة النشر المحدّثة
git fetch origin claude/demo-integrity-fixes
git checkout -B feature/<اسم-مهمتك> origin/claude/demo-integrity-fixes

# 2) نفّذ التغيير مع الالتزام بـ§8

# 3) الفحوص الأربعة (يجب أن تمرّ كلها)
npm run typecheck && npm run lint && npm test && npm run build

# 4) commit بهوية noreply@anthropic.com + التذييلات، ثم push للفرع (بلا PR/merge إلا بطلب)
```

**نقاط الدخول للقراءة أولاً:** `pipeline.ts` → `analysis/analyze-facts.ts` →
`analysis/required-fields.ts` → `analysis/questions.ts` → `app/api/offer/analyze/route.ts` →
`components/analyzers/offer-analyzer.tsx`.

> **ملاحظة:** هذا الملف (`CODEX_HANDOFF.md`) وثيقة مرجعية فقط — ليس جزءًا من PR #10 (أُنشئ قبله).
> يمكنك حذفه أو نقله كما تشاء.
