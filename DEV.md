# 🛠️ دليل التطوير — Travel Consciously

## بيئة التطوير

### المتطلبات
```
- Python 3.6+ (للـ local server)
- Git (مثبت)
- أي محرر نصوص (VS Code موصى به)
- متصفح حديث (Chrome/Firefox/Safari)
```

### الإعدادات الأولية
```bash
# نسخ المستودع
cd C:\apps\Travel consciously

# فتح في VS Code
code .

# تشغيل local server
python -m http.server 8000

# فتح في المتصفح
http://localhost:8000
```

---

## هيكل الملفات

```
C:\apps\Travel consciously\
│
├── .git/                      # مستودع Git
│   └── (commits, branches, etc)
│
├── .gitignore                 # الملفات المستثناة من Git
│
├── index.html                 # الموقع الرئيسي (1400+ سطر)
│   ├── HTML structure
│   ├── CSS مدمج
│   ├── Google Fonts
│   └── JavaScript (للعناصر التفاعلية)
│
├── README.md                  # توثيق أساسي
├── CLAUDE.md                  # ملخص العمل الكامل
├── TODOS.md                   # قائمة المهام والأهداف
└── DEV.md                     # هذا الملف

```

---

## شرح البنية البرمجية

### HTML Structure

```html
<!-- Alert Bar (شريط الأخبار) -->
<div class="alert-bar">
  <!-- محتوى ديناميكي يتحرك أفقياً -->
</div>

<!-- Navigation -->
<nav>
  <!-- قائمة التنقل + لوجو -->
</nav>

<!-- 11 Section رئيسي -->
<section class="hero">...</section>
<section class="thesis">...</section>
<section class="exposes">...</section>
<section class="battle">...</section>
<section class="pillars">...</section>
<section class="author-section">...</section>
<section class="method">...</section>
<section class="cta-section">...</section>

<!-- Footer -->
<footer>...</footer>
```

### نظام الألوان (CSS Variables)

```css
:root {
  --ink: #0a1628;              /* أسود أساسي */
  --ink-deep: #050d1c;         /* أسود عميق */
  --paper: #f5f1e8;            /* بيج فاتح (خلفية) */
  --paper-warm: #ede7d6;       /* بيج دافئ */
  --alarm: #e8401e;            /* أحمر برتقالي (تنبيهات) */
  --alarm-deep: #c5331a;       /* أحمر عميق */
  --gold: #d4a44a;             /* ذهبي */
  --muted: #5a6478;            /* رمادي مكتوم */
  --line: rgba(10,22,40,.12);  /* خط فاتح */
  --line-strong: rgba(10,22,40,.35); /* خط غامق */
}
```

### Responsive Design

```css
/* Desktop (الافتراضي) */
@media(max-width:768px) {
  /* Tablet & Mobile */
}
```

---

## العمل مع Git

### أوامر أساسية

```bash
# فحص الحالة الحالية
git status

# إضافة جميع الملفات
git add .

# حفظ التغييرات
git commit -m "رسالة واصفة للتغييرات"

# عرض السجل
git log --oneline

# إنشاء branch جديد للميزات
git checkout -b feature/اسم-الميزة

# التبديل بين branches
git checkout main

# دمج branch مع main
git merge feature/اسم-الميزة

# حذف branch
git branch -d feature/اسم-الميزة
```

### إضافة الموقع لـ GitHub

```bash
# إضافة remote repository
git remote add origin https://github.com/aalshabi/safrbwai.git

# إعادة تسمية branch الرئيسي
git branch -M main

# دفع للمرة الأولى
git push -u origin main

# دفع التحديثات اللاحقة
git push
```

---

## تحسين الأداء (Performance)

### Best Practices المتبعة ✅
- [x] CSS مدمج (بدون طلبات خارجية)
- [x] Google Fonts محملة بشكل محسّن
- [x] بدون JavaScript ثقيل
- [x] صور مُضغوطة
- [x] بدون مكتبات خارجية كبيرة

### التحسينات المخطط إضافتها
- [ ] استخدام CSS Grid/Flexbox بكفاءة أكبر
- [ ] تقليل حجم CSS (minify)
- [ ] استخدام lazy loading للصور
- [ ] ضغط الصور (WebP format)
- [ ] service worker للـ offline support

### قياس الأداء

```bash
# استخدام Google Lighthouse
https://developers.google.com/web/tools/lighthouse

# أهداف الأداء
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
```

---

## SEO والبحث

### Meta Tags الأساسية (مُضافة بالفعل)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="...">
<title>سافر بوعي — ...</title>
```

### التحسينات المخطط إضافتها

```html
<!-- Open Graph (Facebook/LinkedIn) -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "سافر بوعي",
  "url": "https://example.com"
}
</script>
```

### Sitemap و Robots

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-04-27</lastmod>
  </url>
</urlset>

<!-- robots.txt -->
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

---

## الترجمة والـ RTL

### نقاط مهمة للعربية
- ✅ `lang="ar"` في tag الـ html
- ✅ `dir="rtl"` في الـ html
- ✅ استخدام Google Fonts العربية
- ✅ CSS منفصل للـ RTL

### التوافق مع LTR (إذا أضفنا لاحقاً)

```html
<html lang="ar" dir="rtl">
  <!-- للعربية -->
</html>

<!-- أو للإنجليزية -->
<html lang="en" dir="ltr">
  <!-- للإنجليزية -->
</html>
```

---

## التطوير المستقبلي

### إضافة JavaScript (عند الحاجة)

```javascript
// بدون frameworks في البداية
document.addEventListener('DOMContentLoaded', function() {
  // استخدام vanilla JS
  const buttons = document.querySelectorAll('.btn-primary');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked');
    });
  });
});
```

### استخدام Frameworks (في المستقبل)

```bash
# إذا أردنا React/Vue لاحقاً
npm install next react react-dom
# أو
npm install nuxt vue
```

---

## الأمان (Security)

### Headers الأمان المهمة

```bash
# في .htaccess أو على الخادم
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; font-src 'self' fonts.googleapis.com
```

### التشفير والبيانات الحساسة

```javascript
// استخدام HTTPS دائماً
// عدم تخزين البيانات الحساسة في LocalStorage
// استخدام environment variables للـ API keys
```

---

## الاختبار والـ QA

### اختبار اليدوي

```
□ جميع الروابط تعمل
□ الموقع متجاوب على الأجهزة المختلفة
□ بدون أخطاء في console
□ الخطوط تظهر بشكل صحيح (RTL)
□ الألوان واضحة ومتناسقة
□ الـ animations سلسة
□ الأزرار تستجيب للنقر
```

### أدوات الاختبار الآلية

```bash
# Lighthouse (في Chrome DevTools)
# اضغط F12 > Lighthouse

# WebPageTest
https://www.webpagetest.org

# SEO Checker
https://www.seocompliance.com
```

---

## الدعم والمساعدة

### موارد مفيدة

- [MDN Web Docs](https://developer.mozilla.org) — توثيق شامل
- [CSS-Tricks](https://css-tricks.com) — نصائح CSS
- [GitHub Documentation](https://docs.github.com) — Git و GitHub
- [Arabic Web Standards](https://www.w3.org/International/questions/qa-html-encoding-declarations) — العربية والويب

### المشاكل الشائعة والحلول

**المشكلة:** الخط العربي لا يظهر بشكل صحيح
```
الحل: تأكد من:
- link للـ Google Fonts موجود
- charset="UTF-8" موجود
- font-family صحيح في CSS
```

**المشكلة:** الموقع بطيء
```
الحل:
- استخدم DevTools لتحديد الجزء البطيء
- اضغط F12 > Performance
- قلل حجم الصور
- استخدم CDN للـ fonts
```

**المشكلة:** الموقع غير متجاوب
```
الحل:
- تأكد من viewport meta tag
- اختبر في DevTools device mode
- استخدم media queries
```

---

## الخطوات التالية الفورية

### في هذا الأسبوع
1. [ ] تحسين محرك البحث (SEO)
2. [ ] اختبار شامل على الأجهزة المختلفة
3. [ ] إضافة صور placeholder
4. [ ] شراء domain

### في الأسبوع القادم
1. [ ] تصميم logo
2. [ ] بدء تصوير الفيديوهات
3. [ ] بناء نموذج الاشتراك
4. [ ] إعداد YouTube channel

### في الشهر الأول
1. [ ] نشر أول 3 فيديوهات
2. [ ] تسويق على TikTok
3. [ ] بناء قائمة email
4. [ ] الوصول لـ 1000 زائر

---

**آخر تحديث:** April 27, 2026  
**الإصدار:** 1.0  
**الحالة:** 🟢 جاهز للتطوير
