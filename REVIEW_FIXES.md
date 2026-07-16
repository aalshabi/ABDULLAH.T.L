# REVIEW_FIXES — مرحلة تأمين وتنظيف النسخة التجريبية

**المشروع:** سافر بوعي — `aalshabi/ABDULLAH.T.L`
**الفرع الأساسي:** `claude/safer-bewae-travel-platform-uijts9` (عند الـ commit `f01fc97`)
**الفرع الجديد:** `claude/security-mvp-hardening`
**النطاق:** تأمين + منع تضليل (P0/P1 فقط) — **بدون** بناء ذكاء اصطناعي حقيقي أو قاعدة بيانات كاملة.

---

## نتائج أوامر الفحص النهائية

| الأمر | النتيجة |
|---|---|
| `npm install` | ✅ ناجح |
| `npm run typecheck` (`tsc --noEmit`) | ✅ ناجح (0 أخطاء) |
| `npm run lint` (`next lint`) | ✅ ناجح (0 تحذيرات/أخطاء) |
| `npm test` (`vitest run`) | ✅ **14 اختبار / 4 ملفات — كلها ناجحة** |
| `npm run build` | ✅ ناجح (صفر أخطاء) |
| `npm audit` | ⚠️ الإنتاج نظيف — التفاصيل أدناه |

### `npm audit` حسب الخطورة
- **الإنتاج فقط (`npm audit --omit=dev`): 2 متوسطة، 0 عالية، 0 حرجة.**
  - المصدر: `postcss` الداخلي المضمّن داخل Next.js (GHSA-qx2v-qp2m-jg93) — **وقت البناء فقط**، غير مُعرّض للمتصفح. الإصلاح الوحيد المتاح يُنزّل Next إلى 9.3.3، لذا **لم يُطبَّق** عمدًا.
- **الشجرة الكاملة: 4 (3 متوسطة، 1 عالية)** — الفرق كله في **أدوات الاختبار للتطوير فقط** (`esbuild`/`vite` عبر `vitest`)، لا تُشحن ولا تعمل في الإنتاج/الـ CI؛ الـ«عالية» هي ثغرة خادم `vite` التطويري على ويندوز (`server.fs.deny` bypass) وهي غير منطبقة لأننا لا نشغّل خادم vite.
- ✅ **معيار القبول «لا ثغرة حرجة» متحقّق** (0 حرجة في كل مكان، و0 عالية في الإنتاج).

---

## Commits الجديدة (7)

| # | Commit | المهمة |
|---|---|---|
| 1 | `7ed08e9` chore(security): upgrade Next.js 15.1.4 → 15.5.20 | تحديث أمني |
| 2 | `2b95be1` feat(security): server-side guards for /admin and /dashboard | حماية اللوحات |
| 3 | `03df4b3` feat(demo): prominent demo notices + disable misleading claims | منع التضليل |
| 4 | `a5b0c7f` feat(legal): draft Privacy Policy and Terms pages | الخصوصية/الشروط |
| 5 | `aa4d2a8` feat(security): full security headers incl. CSP | رؤوس الأمان |
| 6 | `1fb6acb` test: unit tests for access guards, demo flags | الاختبارات |
| 7 | `872f91e` fix(security): force /admin and /dashboard dynamic | تصليب الحماية |

---

## قبل وبعد — حسب المهمة

### 1) تحديث الاعتماديات الأمنية
- **قبل:** `next@15.1.4` + `eslint-config-next@15.1.4` — فيها ثغرات معروفة (RCE في React flight، SSRF عبر middleware redirect، cache poisoning، عدة DoS).
- **بعد:** `next@15.5.20` + `eslint-config-next@15.5.20` (أحدث مستقر ضمن 15.x، بلا canary). الحرجة زالت. لم يُستخدم `npm audit fix --force`.
- الملفات: `package.json`, `package-lock.json`.

### 2) حماية `/admin` (خادمية فعلية)
- **قبل:** `/admin` مفتوحة لأي زائر (لا حارس، فقط `noindex`).
- **بعد:** حارس خادمي في `src/app/admin/layout.tsx` (+ `force-dynamic`) يتحقق فعليًا على الخادم:
  - يجب أن يكون المستخدم مسجّلًا عبر Supabase، **و** بريده ضمن `ADMIN_EMAILS`.
  - غير المسجّل → `/auth`؛ مسجّل غير مصرّح → `/`.
  - عند عدم ضبط Supabase (وضع Demo) → **لا تُفتح إطلاقًا** (تحويل إلى `/auth`).
  - `ADMIN_EMAILS` متغيّر **خادمي فقط** (ليس `NEXT_PUBLIC_`) ولا يُرسل للمتصفح.
  - `middleware.ts` طبقة مساعدة إضافية (تحويلات)، لكن الحارس في الـ layout هو المرجع.
- الملفات: `src/app/admin/layout.tsx`, `src/middleware.ts`, `src/lib/auth/access.ts`, `.env.example`.

### 3) حماية `/dashboard`
- **قبل:** مفتوحة، وتوحي بحساب حقيقي.
- **بعد:** حارس خادمي في `src/app/dashboard/page.tsx` (+ `force-dynamic`): عند ضبط Supabase يجب تسجيل الدخول وإلا `/auth`. في وضع Demo تُعرض مع **شريط تنبيه واضح** أن التخزين محلي ومؤقت وغير مرتبط بحساب حقيقي.
- الملفات: `src/app/dashboard/page.tsx`, `src/components/dashboard-view.tsx`, `src/lib/i18n/dictionaries.ts`.

### 4) منع تضليل المستخدم في وضع Demo
- **قبل:** النتائج تظهر كأنها تحليل حقيقي.
- **بعد:** شارة بارزة **أعلى كل نتيجة** (فندق/وجهة/عرض/مقارنة) وقبل الدرجات:
  - AR: «نسخة تجريبية — هذه النتيجة مولّدة لأغراض عرض تجربة المستخدم، ولا تعتمد حاليًا على بيانات حقيقية أو مصادر خارجية.»
  - EN: «Demo version — this result is generated to demonstrate the user experience and is not currently based on verified external data.»
- الملفات: `src/components/shared/demo-notice.tsx` + المحلّلات الأربعة + `dictionaries.ts`.

### 5) تعطيل الأحكام المضللة
- **قبل:** «احجز بثقة / تجنّب الحجز»، «الأفضل قيمةً»، `realPrice`، مبالغ رسوم، درجة عدالة سعر/شفافية كأرقام موثوقة.
- **بعد:**
  - تحليل الفندق: حُذف حكم الثقة (موثوق/تجنّب) والتوصية، واستُبدلا بحالة «غير متاح في النسخة التجريبية — يتطلب بيانات ومصادر فعلية.»
  - المقارنة: حُذف حكم «الأفضل قيمةً» والتمييز؛ تبقى الشبكة كعرض توضيحي تحت الشارة.
  - العرض: أُزيل التقرير التحليلي بالكامل (SeePoint 6) — لا `realPrice` ولا رسوم ولا شفافية/عدالة سعر.
  - البنية وأنواع البيانات محفوظة للاستخدام المستقبلي.
- الملفات: `hotel-analyzer.tsx`, `compare-hotels.tsx`, `offer-analyzer.tsx`, `demo-notice.tsx`.

### 6) تحليل الملفات
- **قبل:** رفع الملف يولّد «تقريرًا» من اسم/حجم الملف (بلا قراءة محتوى).
- **بعد:** تجربة الرفع باقية، لكن بعد الإرسال تظهر رسالة صريحة: «استخراج المحتوى غير مفعّل بعد — لا قراءة PDF/صورة، لا OCR، لا استخراج فعلي.» لا يُنتَج أي تقرير من اسم/حجم الملف. مُتحكَّم به عبر `isOfferExtractionEnabled()` (حاليًا `false`).
- الملفات: `src/lib/offer-extraction.ts`, `src/components/analyzers/offer-analyzer.tsx`, `dictionaries.ts`.

### 7) الخصوصية والشروط
- **قبل:** روابط footer إلى `/#privacy` و`/#terms` بلا صفحات.
- **بعد:** صفحتان فعليتان `/privacy` و`/terms` (عربي/إنجليزي) مع تنبيه أعلى كلٍّ منهما: «مسودة أولية تحتاج مراجعة قانونية قبل الإطلاق التجاري.» تغطي الخصوصية: بيانات الحساب، الملفات المرفوعة، التحليلات، ملفات الارتباط، مزودي الخدمات، مدة الاحتفاظ، حقوق المستخدم، التواصل، والطبيعة التجريبية. الشروط: طبيعة الخدمة الاستشارية، لا ضمان سعر/توفّر، علاقة سكاي كإحالة لا حجز، الاستخدام المقبول، حدود المسؤولية. روابط footer محدّثة + إضافة للـ sitemap.
- الملفات: `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/components/legal-page.tsx`, `footer.tsx`, `sitemap.ts`.

### 8) رؤوس الأمان
- **قبل:** 3 رؤوس فقط (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- **بعد:** مجموعة كاملة على كل المسارات: **CSP** (default-src 'self'؛ object-src 'none'؛ frame-ancestors/form-action 'self'؛ img-src يشمل unsplash و`*.supabase.co`؛ connect-src يشمل `*.supabase.co` و`wss`؛ الخطوط مستضافة ذاتيًا عبر next/font؛ `'unsafe-eval'` في التطوير فقط ولا يُستخدم في الإنتاج) + **HSTS** (سنتان، preload) + **Permissions-Policy** (تعطيل الكاميرا/المايك/الموقع/topics) + Referrer-Policy + X-Content-Type-Options + X-Frame-Options + X-DNS-Prefetch-Control.
- تم التحقق في متصفح فعلي: **لا انتهاكات CSP** والموقع يُعرض سليمًا (خطوط عربية، أنماط، Supabase-ready).
- الملفات: `next.config.mjs`.

### 9) الاختبارات
- أُضيف `vitest` + `jsdom` + `@testing-library/react` و`npm test`. **14 اختبار**:
  1. غير المسجّل لا يفتح `/admin` → `redirect-auth`.
  2. مسجّل غير مدرج في `ADMIN_EMAILS` لا يفتح `/admin` → `redirect-home`.
  3. عند عدم ضبط Supabase لا يُفتح `/admin` (وضع Demo).
  4. نتيجة التحليل تعرض شارة Demo (اختبار عرض `DemoNotice`).
  5. رفع ملف لا يولّد تقريرًا (`isOfferExtractionEnabled() === false`).
  - + حالات حارس `/dashboard` وفحوص قاموس نصوص Demo.
- الملفات: `src/lib/auth/access.test.ts`, `src/lib/offer-extraction.test.ts`, `src/lib/i18n/dictionaries.test.ts`, `src/components/shared/demo-notice.test.tsx`, `vitest.config.mts`.

---

## طريقة ضبط `ADMIN_EMAILS`
1. انسخ `.env.example` إلى `.env.local`.
2. اضبط مفاتيح Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. اضبط `ADMIN_EMAILS` بقائمة بريد مفصولة بفواصل، مثال: `ADMIN_EMAILS=you@example.com,ops@example.com`.
4. **مهم:** متغيّر خادمي فقط — لا تبدأه بـ `NEXT_PUBLIC_`، ولا تضع بريدًا حقيقيًا داخل المستودع. يجب أن تكون المفاتيح موجودة **وقت البناء** لتفعيل الحارس الديناميكي.

---

## القيود الحالية للنسخة التجريبية
- محرّك التحليل لا يزال **مولِّد بيانات حتمي** (لا LLM، لا مصادر) — الشارات وحالات «غير متاح» تمنع الادعاءات المضللة.
- **لا قراءة/استخراج فعلي للملفات** (لا OCR/PDF).
- **لا قاعدة بيانات**؛ سجل التحليلات محلي (localStorage) ومؤقت.
- CSP يستخدم `'unsafe-inline'` للسكربتات (لا يوجد nonce بعد) — تحسين مستقبلي.
- ثغرتان متوسطتان في postcss الداخلي لـ Next (وقت بناء فقط، بلا إصلاح غير مُدمِّر).

## مشكلات لم تُحلّ (ولماذا)
- **postcss الداخلي لـ Next (متوسطة ×2):** لا إصلاح دون تنزيل Next إلى 9.x — خارج نطاق هذه المرحلة.
- **ثغرات أدوات الاختبار (vite/esbuild، dev فقط):** لا تُشحن؛ إصلاحها يتطلب ترقيات كاسرة في vitest — مؤجّلة.
- بناء الذكاء الاصطناعي الحقيقي، قاعدة البيانات + RLS، ربط واتساب/سكاي، والتتبّع — **خارج نطاق هذه المرحلة** عمدًا (مراحل لاحقة).
