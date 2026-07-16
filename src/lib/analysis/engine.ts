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

// ---- deep hotel analysis --------------------------------------------------

export interface HotelDeepResult {
  name: string;
  overall: number;
  categories: { key: string; score: number }[];
  pros: { ar: string; en: string }[];
  cons: { ar: string; en: string }[];
  whoShouldBook: { ar: string; en: string }[];
  whoShouldAvoid: { ar: string; en: string }[];
  alternatives: { name: string; score: number; reason: { ar: string; en: string } }[];
  summary: { ar: string; en: string };
}

const HOTEL_PROS = [
  { ar: "غرف واسعة ونظيفة بمعايير عالية.", en: "Spacious, spotless rooms kept to a high standard." },
  { ar: "طاقم استقبال ودود وسريع الاستجابة.", en: "Warm, responsive front-desk staff." },
  { ar: "فطور بوفيه غني بخيارات محلية وعالمية.", en: "Generous breakfast buffet with local & global options." },
  { ar: "موقع مركزي على مسافة مشي من أبرز المعالم.", en: "Central location, walking distance to top sights." },
  { ar: "قيمة ممتازة مقابل السعر في فئته.", en: "Excellent value for money in its class." },
  { ar: "مسبح سطح بإطلالة بانورامية.", en: "Rooftop pool with a panoramic view." },
  { ar: "عزل صوتي جيد وهدوء ليلاً.", en: "Good sound insulation and quiet at night." },
  { ar: "خدمة تسجيل دخول سريعة بلا انتظار.", en: "Fast, no-wait check-in." },
  { ar: "مرافق عائلية: مسبح أطفال ونادٍ ترفيهي.", en: "Family amenities: kids' pool and activity club." },
];

const HOTEL_CONS = [
  { ar: "جدران رفيعة تنقل الضجيج بين الغرف.", en: "Thin walls carry noise between rooms." },
  { ar: "رسوم مواقف سيارات غير مشمولة.", en: "Parking fees not included." },
  { ar: "حمامات صغيرة نسبياً في الغرف القياسية.", en: "Relatively small bathrooms in standard rooms." },
  { ar: "واي فاي غير مستقر في الطوابق العليا.", en: "Inconsistent Wi-Fi on upper floors." },
  { ar: "ازدحام المسبح في أوقات الذروة.", en: "Crowded pool during peak hours." },
  { ar: "ديكور بعض الغرف يحتاج تجديداً.", en: "Décor in some rooms feels dated." },
  { ar: "رسوم منتجع (resort fee) تُضاف عند الوصول.", en: "A resort fee is added on arrival." },
  { ar: "خيارات طعام محدودة في المحيط القريب.", en: "Limited dining options in the immediate area." },
];

const HOTEL_BOOK = [
  { ar: "الأزواج الباحثون عن أجواء رومانسية.", en: "Couples after a romantic atmosphere." },
  { ar: "العائلات مع أطفال.", en: "Families traveling with kids." },
  { ar: "المسافرون بغرض العمل ويحتاجون موقعاً مركزياً.", en: "Business travelers who need a central base." },
  { ar: "الباحثون عن قيمة جيدة مقابل السعر.", en: "Value-conscious travelers." },
  { ar: "محبو التصوير والإطلالات المدينية.", en: "Photographers and skyline lovers." },
  { ar: "عشاق الطعام القريبون من الأسواق.", en: "Foodies who want markets nearby." },
];

const HOTEL_AVOID = [
  { ar: "أصحاب النوم الخفيف الحسّاسون للضجيج.", en: "Light sleepers sensitive to noise." },
  { ar: "المسافرون بلا سيارة إذا كانت المواصلات بعيدة.", en: "Car-less travelers if transit is far." },
  { ar: "الميزانيات الضيقة عند مواسم الذروة.", en: "Tight budgets during peak season." },
  { ar: "المجموعات الكبيرة التي تحتاج غرفاً متجاورة.", en: "Large groups needing adjacent rooms." },
  { ar: "من يتوقع خدمة خمس نجوم كاملة.", en: "Guests expecting full five-star service." },
  { ar: "الباحثون عن هدوء تام بعيداً عن المركز.", en: "Those wanting total quiet away from the center." },
];

const ALT_HOTELS = [
  { ar: "منتجع اللؤلؤة", en: "The Pearl Resort" },
  { ar: "فندق الأفق الأزرق", en: "Blue Horizon Hotel" },
  { ar: "منتجع الواحة الملكية", en: "Royal Oasis Resort" },
  { ar: "فندق المدينة الذهبية", en: "Golden City Hotel" },
  { ar: "منتجع النخيل الساحلي", en: "Palm Coast Resort" },
  { ar: "أجنحة سكاي لاين", en: "Skyline Suites" },
];

const ALT_REASONS = [
  { ar: "أعلى في القيمة مقابل السعر.", en: "Higher value for money." },
  { ar: "موقع أقرب للمعالم الرئيسية.", en: "Closer to the main attractions." },
  { ar: "أنسب للعائلات والأطفال.", en: "Better suited to families." },
  { ar: "أجواء أرقى لشهر العسل.", en: "A more romantic honeymoon vibe." },
  { ar: "تجربة طعام أفضل داخل الفندق.", en: "A stronger in-house dining experience." },
];

const HOTEL_CATEGORY_KEYS = [
  "valueForMoney",
  "location",
  "family",
  "honeymoon",
  "luxury",
  "food",
] as const;

export function analyzeHotelDeep(name: string, city: string, _locale: Locale): HotelDeepResult {
  const trimmed = name.trim();
  const rng = makeRng(hashString(`hotel-deep:${trimmed.toLowerCase()}:${city.trim().toLowerCase()}`));

  const categories = HOTEL_CATEGORY_KEYS.map((key) => ({ key, score: metricScore(rng, 30) }));
  const overall = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);

  const strongCount = overall >= 75 ? 5 : overall >= 55 ? 4 : 3;
  const weakCount = overall >= 75 ? 2 : overall >= 55 ? 3 : 4;

  // Alternatives: two distinct illustrative options, each beating one strength.
  const altNames = pick(rng, ALT_HOTELS, 3);
  const altReasons = pick(rng, ALT_REASONS, 3);
  const alternatives = altNames.map((n, i) => ({
    name: _locale === "ar" ? n.ar : n.en,
    score: Math.min(98, overall + 4 + Math.floor(rng() * 12)),
    reason: altReasons[i],
  }));

  const summary =
    overall >= 75
      ? {
          ar: `${trimmed || "هذا الفندق"} خيار قوي ومتوازن — احجز بثقة بعد تثبيت السعر شاملاً الرسوم.`,
          en: `${trimmed || "This hotel"} is a strong, balanced pick — book with confidence after locking the fee-inclusive price.`,
        }
      : overall >= 55
        ? {
            ar: `${trimmed || "هذا الفندق"} خيار جيد بشروط — راجع السلبيات وقارنه بالبدائل أدناه.`,
            en: `${trimmed || "This hotel"} is a good option with caveats — weigh the cons and compare the alternatives below.`,
          }
        : {
            ar: `${trimmed || "هذا الفندق"} دون المتوسط في عدة معايير — فكّر جدياً في البدائل أدناه.`,
            en: `${trimmed || "This hotel"} underperforms on several fronts — seriously consider the alternatives below.`,
          };

  return {
    name: trimmed,
    overall,
    categories,
    pros: pick(rng, HOTEL_PROS, strongCount),
    cons: pick(rng, HOTEL_CONS, weakCount),
    whoShouldBook: pick(rng, HOTEL_BOOK, 3),
    whoShouldAvoid: pick(rng, HOTEL_AVOID, 3),
    alternatives,
    summary,
  };
}

// ---- deep offer analysis (upload + extraction) ----------------------------

type Bi = { ar: string; en: string };

export interface ExtractedOffer {
  destination: Bi;
  nights: number;
  travelers: number;
  hotel: { name: Bi; stars: number; board: Bi };
  flight: { airline: string; route: Bi; stops: number; baggage: Bi };
  transfer: { included: boolean; type: Bi };
  itinerary: { day: number; title: Bi }[];
}

export interface OfferDeepResult {
  advertisedPrice: number | null;
  realPrice: number;
  extracted: ExtractedOffer;
  scores: {
    transparency: number;
    priceFairness: number;
    overallValue: number;
    hotelQuality: number;
    flights: number;
    transfers: number;
  };
  travelRisk: { level: "low" | "medium" | "high"; score: number };
  missingServices: Bi[];
  hiddenCosts: { label: Bi; amount: number }[];
  hotelNote: Bi;
  flightNote: Bi;
  transferNote: Bi;
  itineraryNote: Bi;
  recommendation: Bi;
}

const OFFER_DESTINATIONS: Bi[] = [
  { ar: "إسطنبول، تركيا", en: "Istanbul, Turkey" },
  { ar: "دبي، الإمارات", en: "Dubai, UAE" },
  { ar: "كوالالمبور، ماليزيا", en: "Kuala Lumpur, Malaysia" },
  { ar: "تبليسي، جورجيا", en: "Tbilisi, Georgia" },
  { ar: "باكو، أذربيجان", en: "Baku, Azerbaijan" },
  { ar: "القاهرة، مصر", en: "Cairo, Egypt" },
];

const OFFER_HOTELS: Bi[] = [
  { ar: "فندق مرمرة بالاس", en: "Marmara Palace Hotel" },
  { ar: "منتجع الواحة الذهبية", en: "Golden Oasis Resort" },
  { ar: "فندق سيتي سنتر", en: "City Center Hotel" },
  { ar: "منتجع بحيرة الزمرد", en: "Emerald Lake Resort" },
];

const OFFER_BOARDS: Bi[] = [
  { ar: "بدون وجبات (RO)", en: "Room only (RO)" },
  { ar: "إفطار فقط (BB)", en: "Bed & breakfast (BB)" },
  { ar: "نصف إقامة (HB)", en: "Half board (HB)" },
  { ar: "إقامة كاملة (FB)", en: "Full board (FB)" },
];

const OFFER_AIRLINES = ["Turkish Airlines", "flydubai", "Pegasus", "Saudia", "EgyptAir", "AJet"];

const OFFER_BAGGAGE: Bi[] = [
  { ar: "حقيبة ٢٠ كجم مشمولة", en: "20kg checked bag included" },
  { ar: "حقيبة يد ٨ كجم فقط", en: "Cabin bag 8kg only" },
  { ar: "بدون أمتعة مشمولة", en: "No baggage included" },
];

const OFFER_TRANSFERS: Bi[] = [
  { ar: "استقبال وتوصيل خاص", en: "Private airport transfers" },
  { ar: "توصيل جماعي (شتل)", en: "Shared shuttle transfer" },
  { ar: "غير مشمول", en: "Not included" },
];

const OFFER_ITINERARY: Bi[] = [
  { ar: "الوصول والاستقبال", en: "Arrival & welcome" },
  { ar: "جولة المدينة التاريخية", en: "Historic city tour" },
  { ar: "رحلة بحرية بانورامية", en: "Panoramic boat cruise" },
  { ar: "زيارة المعالم الطبيعية", en: "Natural landmarks visit" },
  { ar: "يوم حر للتسوق", en: "Free day for shopping" },
  { ar: "يوم اختياري (رحلة إضافية)", en: "Optional day (paid excursion)" },
  { ar: "المغادرة والتوصيل", en: "Departure & drop-off" },
];

const OFFER_MISSING: Bi[] = [
  { ar: "تأمين سفر غير مشمول.", en: "Travel insurance not included." },
  { ar: "رسوم دخول المعالم على حسابك.", en: "Attraction entry fees at your own cost." },
  { ar: "لا يوجد مرشد ناطق بالعربية.", en: "No Arabic-speaking guide." },
  { ar: "تأشيرة الدخول غير مشمولة.", en: "Entry visa not included." },
  { ar: "وجبات الغداء والعشاء غير مذكورة.", en: "Lunch and dinner not specified." },
  { ar: "المشروبات خارج الوجبات غير مشمولة.", en: "Drinks outside meals not included." },
];

const OFFER_HIDDEN: { label: Bi; amount: number }[] = [
  { label: { ar: "ضريبة سياحة المدينة", en: "City tourism tax" }, amount: 0 },
  { label: { ar: "رسوم منتجع إجبارية", en: "Mandatory resort fee" }, amount: 0 },
  { label: { ar: "رسوم أمتعة إضافية", en: "Extra baggage fee" }, amount: 0 },
  { label: { ar: "بقشيش السائق والمرشد", en: "Driver & guide tips" }, amount: 0 },
  { label: { ar: "فرق ترقية المقعد", en: "Seat upgrade surcharge" }, amount: 0 },
];

export function analyzeOfferDeep(
  seed: string,
  advertised: number | null,
  _locale: Locale
): OfferDeepResult {
  const rng = makeRng(hashString(`offer-deep:${seed.trim().toLowerCase().slice(0, 160)}:${advertised ?? 0}`));

  const nights = 3 + Math.floor(rng() * 6); // 3-8
  const travelers = 1 + Math.floor(rng() * 4); // 1-4
  const stars = 3 + Math.floor(rng() * 3); // 3-5
  const stops = Math.floor(rng() * 3); // 0-2
  const board = OFFER_BOARDS[Math.floor(rng() * OFFER_BOARDS.length)];
  const baggage = OFFER_BAGGAGE[Math.floor(rng() * OFFER_BAGGAGE.length)];
  const transferType = OFFER_TRANSFERS[Math.floor(rng() * OFFER_TRANSFERS.length)];
  const transferIncluded = transferType.en !== "Not included";
  const destination = OFFER_DESTINATIONS[Math.floor(rng() * OFFER_DESTINATIONS.length)];
  const airline = OFFER_AIRLINES[Math.floor(rng() * OFFER_AIRLINES.length)];
  const hotelName = OFFER_HOTELS[Math.floor(rng() * OFFER_HOTELS.length)];

  const routeText: Bi =
    stops === 0
      ? { ar: `رحلة مباشرة إلى ${destination.ar.split("،")[0]}`, en: `Direct flight to ${destination.en.split(",")[0]}` }
      : { ar: `${stops} توقف عبر محطة ترانزيت`, en: `${stops} stop(s) via a transit hub` };

  // Build a day-by-day itinerary sized to the trip.
  const middle = pick(rng, OFFER_ITINERARY.slice(1, 6), Math.min(nights - 1, 4));
  const itinerary = [
    { day: 1, title: OFFER_ITINERARY[0] },
    ...middle.map((t, i) => ({ day: i + 2, title: t })),
    { day: nights, title: OFFER_ITINERARY[OFFER_ITINERARY.length - 1] },
  ].filter((v, i, a) => a.findIndex((x) => x.day === v.day) === i);

  const extracted: ExtractedOffer = {
    destination,
    nights,
    travelers,
    hotel: { name: hotelName, stars, board },
    flight: { airline, route: routeText, stops, baggage },
    transfer: { included: transferIncluded, type: transferType },
    itinerary,
  };

  // Scores derived from the extracted facts for realism.
  const hotelQuality = clamp(30 + stars * 11 + Math.floor(rng() * 12));
  const noBag = baggage.en === "No baggage included";
  const flightsScore = clamp(92 - stops * 22 - (noBag ? 16 : 0) + Math.floor(rng() * 8));
  const transfersScore = transferIncluded ? clamp(72 + Math.floor(rng() * 24)) : clamp(28 + Math.floor(rng() * 14));

  const missingServices = pick(rng, OFFER_MISSING, 2 + Math.floor(rng() * 3)); // 2-4
  const hiddenCount = 1 + Math.floor(rng() * 3); // 1-3
  const hiddenCosts = pick(rng, OFFER_HIDDEN, hiddenCount).map((h) => ({
    label: h.label,
    amount: Math.round(60 + rng() * 320),
  }));

  const transparency = clamp(96 - missingServices.length * 9 - hiddenCosts.length * 6 + Math.floor(rng() * 6));
  const priceFairness = clamp(40 + rng() * 55);
  const overallValue = Math.round((hotelQuality + flightsScore + transfersScore + priceFairness) / 4);

  const base = advertised && advertised > 0 ? advertised : Math.round((1400 + rng() * 3800) * travelers);
  const realPrice = base + hiddenCosts.reduce((s, c) => s + c.amount, 0);

  const riskScore = clamp(Math.round((100 - transparency) * 0.6 + missingServices.length * 8 + (transferIncluded ? 0 : 12)));
  const riskLevel: "low" | "medium" | "high" = riskScore >= 55 ? "high" : riskScore >= 30 ? "medium" : "low";

  return {
    advertisedPrice: advertised && advertised > 0 ? advertised : null,
    realPrice,
    extracted,
    scores: { transparency, priceFairness, overallValue, hotelQuality, flights: flightsScore, transfers: transfersScore },
    travelRisk: { level: riskLevel, score: riskScore },
    missingServices,
    hiddenCosts,
    hotelNote: note(hotelQuality, {
      hi: { ar: `فندق ${stars} نجوم بمستوى جيد ومطابق للوصف غالباً.`, en: `A solid ${stars}-star property, generally matching the description.` },
      lo: { ar: `تصنيف ${stars} نجوم قد يكون محلياً لا دولياً — تحقّق من الصور الحديثة.`, en: `The ${stars}-star rating may be local, not international — verify recent photos.` },
    }),
    flightNote: note(flightsScore, {
      hi: { ar: `رحلة عبر ${airline} بجودة مقبولة.`, en: `A reasonable-quality flight on ${airline}.` },
      lo: { ar: `${stops} توقف${noBag ? " وبدون أمتعة مشمولة" : ""} — تحقّق من مدة الترانزيت.`, en: `${stops} stop(s)${noBag ? " and no baggage" : ""} — check the transit duration.` },
    }),
    transferNote: transferIncluded
      ? { ar: "التنقلات من وإلى المطار مشمولة.", en: "Airport transfers are included." }
      : { ar: "التنقلات غير مشمولة — أضِفها لحساب التكلفة الحقيقية.", en: "Transfers are not included — add them to the true cost." },
    itineraryNote: note(overallValue, {
      hi: { ar: "برنامج متوازن بين الجولات والأيام الحرة.", en: "A balanced program of tours and free days." },
      lo: { ar: "برنامج فضفاض بأيام حرة كثيرة أو رحلات اختيارية مدفوعة.", en: "A loose program with many free days or paid optional trips." },
    }),
    recommendation:
      overallValue >= 70 && transparency >= 65
        ? { ar: "عرض عادل نسبياً — أكّد شمول الخدمات كتابياً قبل الدفع.", en: "A relatively fair offer — confirm inclusions in writing before paying." }
        : transparency < 50
          ? { ar: "شفافية منخفضة وتكاليف مخفية — تفاوض أو اطلب عرضاً مفصّلاً بديلاً.", en: "Low transparency and hidden costs — negotiate or request a detailed alternative." }
          : { ar: "عرض متوسط — سُدّ الخدمات الناقصة واحسب السعر الحقيقي قبل القرار.", en: "An average offer — cover the missing services and compute the real price first." },
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function note(score: number, opts: { hi: Bi; lo: Bi }): Bi {
  return score >= 60 ? opts.hi : opts.lo;
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
