import type { Locale } from "@/lib/i18n/config";

/**
 * Deterministic, seeded "AI" analysis engine.
 *
 * Real production deployments would swap the internals of these functions for
 * calls to an LLM + data providers (reviews APIs, price scrapers, etc). The
 * public shape is designed so that swap is drop-in: same inputs, same output
 * types. For now results are generated deterministically from a string seed so
 * the UX is fully functional, varied and reproducible without a backend.
 */

export type MetricKey = string;

export interface Metric {
  key: MetricKey;
  score: number; // 0-100
}

export interface AnalysisResult {
  score: number; // overall 0-100
  metrics: Metric[];
  redFlags: { ar: string; en: string }[];
  greenFlags: { ar: string; en: string }[];
  recommendation: { ar: string; en: string };
}

export interface DestinationResult extends AnalysisResult {
  bestSeason: { ar: string; en: string };
  costLevel: { ar: string; en: string };
  touristTraps: { ar: string; en: string }[];
}

export interface OfferResult extends AnalysisResult {
  advertisedPrice: number | null;
  realPrice: number;
  hiddenCosts: { label: { ar: string; en: string }; amount: number }[];
}

// ---- seeded RNG -----------------------------------------------------------

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

function pick<T>(rng: () => number, arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function metricScore(rng: () => number, floor = 25): number {
  return Math.round(floor + rng() * (100 - floor));
}

// ---- flag pools -----------------------------------------------------------

const HOTEL_RED = [
  { ar: "٤٠٪ من المراجعات نُشرت في أسبوع واحد — نمط مشبوه.", en: "40% of reviews posted in a single week — suspicious pattern." },
  { ar: "صور الغرفة تعود لتجديد قبل ٤ سنوات.", en: "Room photos date back to a renovation 4 years ago." },
  { ar: "رسوم خدمة إجبارية غير مذكورة في السعر المعلن.", en: "Mandatory service fee not shown in the advertised price." },
  { ar: "المسافة للشاطئ في الوصف مضلّلة (٢ كم فعلياً).", en: "Distance to the beach is misleading (2 km in reality)." },
  { ar: "مراجعات إيجابية بحسابات بلا تاريخ سفر سابق.", en: "Positive reviews from accounts with no prior travel history." },
  { ar: "سياسة إلغاء صارمة مخفية في الشروط الصغيرة.", en: "Strict cancellation policy hidden in the fine print." },
];

const HOTEL_GREEN = [
  { ar: "توزيع التقييمات طبيعي عبر عدة سنوات.", en: "Rating distribution is natural across several years." },
  { ar: "الصور مطابقة لمراجعات النزلاء الحديثة.", en: "Photos match recent guest reviews." },
  { ar: "الأسعار شفافة وتشمل الضرائب.", en: "Pricing is transparent and tax-inclusive." },
  { ar: "ردود الإدارة على الشكاوى سريعة وحقيقية.", en: "Management responses to complaints are prompt and genuine." },
  { ar: "الموقع دقيق ومطابق للخريطة.", en: "Location is accurate and matches the map." },
];

const DEST_RED = [
  { ar: "أسعار سيارات الأجرة للسياح مضاعفة قرب المطار.", en: "Taxi prices for tourists double near the airport." },
  { ar: "جولات \"مجانية\" تنتهي بضغط شراء قوي.", en: "\"Free\" tours end with heavy purchase pressure." },
  { ar: "مطاعم الواجهة السياحية أغلى ٣ أضعاف.", en: "Waterfront tourist restaurants cost 3× more." },
  { ar: "موسم الذروة يرفع الأسعار ويخنق التجربة.", en: "Peak season inflates prices and ruins the experience." },
];

const DEST_GREEN = [
  { ar: "شبكة نقل عام موثوقة ورخيصة.", en: "Reliable and cheap public transport network." },
  { ar: "الأمان مرتفع في المناطق السياحية والسكنية.", en: "High safety across tourist and residential areas." },
  { ar: "أصالة ثقافية بعيداً عن المسارات المزدحمة.", en: "Cultural authenticity away from crowded trails." },
  { ar: "قيمة ممتازة مقابل السعر خارج الموسم.", en: "Excellent value for money off-season." },
];

const OFFER_RED = [
  { ar: "\"من\" في السعر تعني أقل غرفة في أبعد موعد.", en: "\"From\" price means the smallest room on the farthest date." },
  { ar: "الترانزيت ١٤ ساعة موصوف كـ\"رحلة مريحة\".", en: "A 14-hour transit is described as a \"comfortable trip\"." },
  { ar: "التأمين والحقائب غير مشمولين رغم الإيحاء.", en: "Insurance and baggage excluded despite the implication." },
  { ar: "التذكرة غير قابلة للاسترداد أو التغيير.", en: "Ticket is non-refundable and non-changeable." },
  { ar: "الفندق \"٥ نجوم\" بتصنيف محلي لا دولي.", en: "The \"5-star\" hotel uses a local, not international, rating." },
];

const OFFER_GREEN = [
  { ar: "رحلة مباشرة فعلاً بلا ترانزيت مخفي.", en: "Genuinely direct flight with no hidden transit." },
  { ar: "السعر يشمل الضرائب والحقائب.", en: "Price includes taxes and baggage." },
  { ar: "إمكانية استرداد جزئي حتى ٤٨ ساعة.", en: "Partial refund available up to 48 hours." },
];

const SEASONS = [
  { ar: "أكتوبر — مارس (طقس معتدل)", en: "October – March (mild weather)" },
  { ar: "أبريل — يونيو (ربيع لطيف)", en: "April – June (pleasant spring)" },
  { ar: "نوفمبر — فبراير (ذروة الاعتدال)", en: "November – February (peak comfort)" },
];

const COST_LEVELS = [
  { ar: "منخفض", en: "Low" },
  { ar: "متوسط", en: "Moderate" },
  { ar: "مرتفع", en: "High" },
];

const HOTEL_RECS: { min: number; ar: string; en: string }[] = [
  { min: 80, ar: "احجز بثقة — لكن ثبّت السعر شاملاً الرسوم كتابياً.", en: "Book with confidence — but lock the fee-inclusive price in writing." },
  { min: 60, ar: "خيار جيد بشرط قراءة سياسة الإلغاء والرسوم بعناية.", en: "A good option, provided you read the cancellation and fee policy carefully." },
  { min: 40, ar: "توقّف — قارنه بفندقين آخرين قبل الالتزام.", en: "Pause — compare it against two other hotels before committing." },
  { min: 0, ar: "تجنّب الحجز — الإشارات المزيفة تفوق الحقيقية.", en: "Avoid booking — fake signals outweigh the genuine ones." },
];

// ---- generators -----------------------------------------------------------

export function analyzeHotel(name: string, city: string, _locale: Locale) {
  const rng = makeRng(hashString(`hotel:${name.trim().toLowerCase()}:${city.trim().toLowerCase()}`));
  const metricKeys = [
    "reviewAuthenticity",
    "priceTransparency",
    "photoAccuracy",
    "locationHonesty",
    "hiddenFees",
  ];
  const metrics = metricKeys.map((key) => ({ key, score: metricScore(rng) }));
  const score = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
  const redCount = score >= 75 ? 1 : score >= 50 ? 2 : 3;
  const greenCount = score >= 75 ? 3 : score >= 50 ? 2 : 1;
  const rec = HOTEL_RECS.find((r) => score >= r.min)!;
  const result: AnalysisResult = {
    score,
    metrics,
    redFlags: pick(rng, HOTEL_RED, redCount),
    greenFlags: pick(rng, HOTEL_GREEN, greenCount),
    recommendation: { ar: rec.ar, en: rec.en },
  };
  return result;
}

export function analyzeDestination(name: string, _locale: Locale): DestinationResult {
  const rng = makeRng(hashString(`dest:${name.trim().toLowerCase()}`));
  const metricKeys = ["safety", "value", "crowds", "authenticity", "accessibility"];
  const metrics = metricKeys.map((key) => ({ key, score: metricScore(rng, 35) }));
  const score = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
  const rec =
    score >= 70
      ? { ar: "وجهة تستحق الزيارة — خطّط خارج موسم الذروة لأفضل قيمة.", en: "A worthwhile destination — plan outside peak season for the best value." }
      : { ar: "زُرها بحذر وميزانية واضحة، وتجنّب الفخاخ السياحية أدناه.", en: "Visit carefully with a clear budget, and avoid the tourist traps below." };
  return {
    score,
    metrics,
    redFlags: [],
    greenFlags: pick(rng, DEST_GREEN, 3),
    recommendation: rec,
    bestSeason: pick(rng, SEASONS, 1)[0],
    costLevel: COST_LEVELS[Math.min(2, Math.floor((100 - metrics[1].score) / 34))],
    touristTraps: pick(rng, DEST_RED, 3),
  };
}

export function analyzeOffer(text: string, advertised: number | null, _locale: Locale): OfferResult {
  const rng = makeRng(hashString(`offer:${text.trim().toLowerCase().slice(0, 120)}:${advertised ?? 0}`));
  const metricKeys = ["priceHonesty", "transitQuality", "flexibility", "inclusions"];
  const metrics = metricKeys.map((key) => ({ key, score: metricScore(rng) }));
  const score = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
  const base = advertised && advertised > 0 ? advertised : Math.round(1200 + rng() * 4000);
  const hiddenCosts = pick(
    rng,
    [
      { label: { ar: "رسوم الحقائب", en: "Baggage fees" }, amount: Math.round(120 + rng() * 280) },
      { label: { ar: "تأمين إجباري", en: "Mandatory insurance" }, amount: Math.round(90 + rng() * 210) },
      { label: { ar: "رسوم اختيار المقعد", en: "Seat selection" }, amount: Math.round(60 + rng() * 140) },
      { label: { ar: "ضريبة الوجهة", en: "Destination tax" }, amount: Math.round(80 + rng() * 220) },
    ],
    score >= 70 ? 1 : score >= 45 ? 2 : 3
  );
  const realPrice = base + hiddenCosts.reduce((s, c) => s + c.amount, 0);
  const rec =
    score >= 70
      ? { ar: "عرض صادق نسبياً — أكّد شمول الأسعار قبل الدفع.", en: "A relatively honest offer — confirm inclusions before paying." }
      : { ar: "السعر الحقيقي أعلى بكثير من المعلن. اقرأ المطبّات أدناه.", en: "The real price is much higher than advertised. Read the catches below." };
  return {
    score,
    metrics,
    redFlags: pick(rng, OFFER_RED, score >= 70 ? 1 : 3),
    greenFlags: pick(rng, OFFER_GREEN, score >= 70 ? 2 : 1),
    recommendation: rec,
    advertisedPrice: advertised && advertised > 0 ? advertised : null,
    realPrice,
    hiddenCosts,
  };
}

export function compareHotels(names: string[], locale: Locale) {
  const rows = names
    .filter((n) => n.trim().length > 0)
    .map((name) => {
      const r = analyzeHotel(name, "", locale);
      return { name, score: r.score, metrics: r.metrics };
    });
  const winnerIndex = rows.reduce(
    (best, r, i, arr) => (r.score > arr[best].score ? i : best),
    0
  );
  return { rows, winnerIndex };
}

/** Simulated processing latency for the "AI is thinking" UX. */
export const ANALYSIS_DELAY_MS = 1600;
