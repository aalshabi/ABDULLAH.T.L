export type KnowledgeCategory = "hotels" | "flights" | "pricing" | "reviews";

export interface Article {
  slug: string;
  category: KnowledgeCategory;
  readTime: number;
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
}

export const articles: Article[] = [
  {
    slug: "fake-transit",
    category: "flights",
    readTime: 4,
    title: { ar: "الترانزيت الوهمي: الكذبة الأكبر في الطيران", en: "Fake Transit: Aviation's Biggest Lie" },
    excerpt: {
      ar: "كيف تحوّل شركات السفر ترانزيت ١٤ ساعة إلى \"رحلة مريحة\" — وكيف تكشفها في ثوانٍ.",
      en: "How agencies turn a 14-hour layover into a \"comfortable trip\" — and how to spot it in seconds.",
    },
  },
  {
    slug: "same-hotel-photos",
    category: "hotels",
    readTime: 3,
    title: { ar: "نفس الفندق، نفس الغرفة: خدع الصور", en: "Same Hotel, Same Room: Photo Tricks" },
    excerpt: {
      ar: "عدسات واسعة، إضاءة مثالية، وزوايا مختارة. تعلّم قراءة صور الغرف كخبير.",
      en: "Wide lenses, perfect lighting, cherry-picked angles. Learn to read room photos like a pro.",
    },
  },
  {
    slug: "cheap-price-trick",
    category: "pricing",
    readTime: 5,
    title: { ar: "خدعة السعر الرخيص: السعر الحقيقي ≠ سعر الحجز", en: "The Cheap-Price Trick: Real Price ≠ Booking Price" },
    excerpt: {
      ar: "الرسوم المخفية، \"من\" السحرية، وضرائب اللحظة الأخيرة. احسب التكلفة الحقيقية دائماً.",
      en: "Hidden fees, the magic \"from\", and last-second taxes. Always compute the true cost.",
    },
  },
  {
    slug: "read-hotel-reviews",
    category: "reviews",
    readTime: 6,
    title: { ar: "كيف تقرأ تقييمات الفنادق؟ ٦ قواعد", en: "How to Read Hotel Reviews: 6 Rules" },
    excerpt: {
      ar: "توزيع التواريخ، لغة المراجعات، وردود الإدارة. ست قواعد لفصل الحقيقي عن المزيّف.",
      en: "Date distribution, review language, and management replies. Six rules to separate real from fake.",
    },
  },
  {
    slug: "season-trap",
    category: "pricing",
    readTime: 4,
    title: { ar: "فخ نفس الفندق غير موسم", en: "The Off-Season Same-Hotel Trap" },
    excerpt: {
      ar: "الموسم يغيّر كل شيء: السعر، الازدحام، والتجربة. متى تحجز فعلاً؟",
      en: "Season changes everything: price, crowds and experience. When should you actually book?",
    },
  },
  {
    slug: "refundable-tickets",
    category: "flights",
    readTime: 3,
    title: { ar: "التذاكر القابلة للاسترداد: درعك الأول", en: "Refundable Tickets: Your First Shield" },
    excerpt: {
      ar: "لماذا يستحق الفرق البسيط في السعر؟ ومتى تكون \"غير القابلة للاسترداد\" فخاً.",
      en: "Why the small price difference is worth it — and when \"non-refundable\" is a trap.",
    },
  },
];
