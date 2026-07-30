# سافر بوعي — SafrBwai

سافر بوعي أداة تجريبية تساعد المسافر على مراجعة المعلومات المذكورة في عرض السفر النصي قبل الحجز.

SafrBwai is an experimental tool that helps travelers review the information stated in a text travel offer before booking.

## نطاق الـBeta المغلقة

- تحليل عروض السفر النصية فقط.
- تحليل حتمي قائم على قواعد.
- لا يستخدم AI أو LLM.
- يدعم العربية والإنجليزية.
- ملفات PDF والصور والروابط غير مدعومة.
- لا توجد حسابات مستخدمين مفعّلة في تدفق الـBeta الحالي.
- لا تُحفظ نصوص العروض أو نتائج التحليل في قاعدة بيانات.
- Feedback معطّل، ولا توجد Analytics أو أدوات تتبع تسويقي.
- النتائج استشارية ولا تضمن صحة العرض أو البائع.

## Closed Beta scope

- Text analysis only.
- Deterministic rule-based analysis.
- No AI or LLM.
- Arabic and English are supported.
- PDF files, images, and links are not supported.
- User accounts are not enabled in the current Beta flow.
- Offer text and analysis results are not stored in a database.
- Feedback is disabled, with no analytics or marketing tracking.
- Results are advisory and are not a guarantee of the offer or seller.

## طريقة العمل

يلصق المستخدم نص عرض السفر في صفحة تحليل العرض. يُرسل النص إلى API التحليل لتنفيذ الطلب باستخدام المحرك الحتمي القائم على القواعد. قد تعرض النتيجة دليلًا مختصرًا مأخوذًا من النص، لكن هذا الدليل لا يدخل في نصوص النسخ ولا يُخزّن.

The user pastes a travel-offer text into the offer-analysis page. The text is sent to the analysis API and processed by the deterministic rule-based engine. The result may show short evidence taken from the text, but that evidence is excluded from copied output and is not stored.

لا تُدخل بيانات شخصية أو معلومات دفع. تحقّق من المصدر الرسمي قبل أي حجز أو التزام مالي.

Do not enter personal or payment information. Verify with the official source before booking or making a financial commitment.

## التشغيل المحلي

```bash
npm install
npm run dev
```

يفتح التطبيق افتراضيًا على:

```text
http://localhost:3000
```

## الفحوص

```bash
npm run typecheck
npm run lint
npm test
npm run test:regression
npm run build
```

## الحالة

هذه Closed Beta محدودة. ملفات الخصوصية والشروط مسودات أولية تحتاج مراجعة قانونية قبل أي إطلاق تجاري.

© 2026 سافر بوعي · SafrBwai — Abdullah Travel Lab
