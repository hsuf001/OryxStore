import { Product, ProductReview } from '../types';

const legacyComments = new Set([
  'منتج ممتاز جداً والتوصيل كان في الوقت المحدد. شكراً متجر أوريكس!',
  'خدمة العملاء رائعة والمنتج مطابق تماماً لما هو في الصور.',
  'منتج ممتاز جداً ومطابق للمواصفات تماماً. التوصيل كان في أقل من يومين.',
  'سعيدة جداً بالمنتج وجودته عالية. خدمة عملاء ممتازة وسريعة.',
  'المنتج فخم جداً وخدمة التوصيل كانت سريعة جداً. أنصح به بشدة.',
  'جودة ممتازة ومطابقة تماماً لما هو معروض في الصور. شكراً متجر أوريكس.',
  'وصلني الطلب في أقل من 48 ساعة، والمعاينة قبل الدفع تعطي ثقة كبيرة.'
]);

const generatedNames = new Set(['سلطان الشمري', 'نورة القحطاني', 'فهد الدوسري', 'ريم العتيبي', 'ماجد الحربي', 'سارة الغامدي', 'تركي المطيري', 'هيا الزهراني', 'عبدالله الشهري', 'لمى السبيعي', 'راكان العنزي', 'جود القرني']);
const generatedComments = [
  (title: string) => `جربت ${title} وكانت تجربتي معه موفقة، وسهل علي استخدامه.`,
  (title: string) => `وصلني ${title} بحالة جيدة، وكانت تجربة الطلب مريحة.`,
  (title: string) => `استخدمت ${title} أكثر من مرة، ووجدته عملياً للاستخدام اليومي.`,
  (title: string) => `تجربتي مع ${title} جيدة، والمنتج مطابق لوصفه في المتجر.`,
  (title: string) => `اخترت ${title} لاحتياجي اليومي، وكانت التجربة سهلة ومناسبة.`,
  (title: string) => `طلب ${title} كان سهلاً، ووصلني كما توقعت. أنصح بالمتجر.`,
  (title: string) => `أعجبني ${title} من أول استخدام، والتواصل مع المتجر كان واضحاً.`,
  (title: string) => `اشتريت ${title} وكانت جودته مناسبة لما أبحث عنه.`,
  (title: string) => `تجربة ${title} كانت جيدة، وسأفكر في طلبه مرة أخرى.`,
  (title: string) => `وصل ${title} بشكل مرتب، وكانت تجربتي مع المتجر سلسة.`,
  (title: string) => `استخدام ${title} كان بسيطاً، وأنا راضٍ عن تجربتي معه.`,
  (title: string) => `سعيدة باختياري ${title}، المنتج عملي والتجربة كانت مريحة.`
];
export function getProductReviewStats(product: Product): { rating: number; reviewsCount: number } | null {
  const reviews = getProductReviews(product);
  if (reviews.length === 0) return null;

  return {
    rating: reviews.reduce((total, review) => total + review.rating, 0) / reviews.length,
    reviewsCount: reviews.length
  };
}

export function getProductReviews(product: Product): ProductReview[] {
  const reviews = product.reviews || [];
  const title = product.title.trim() || 'هذا المنتج';
  const isGeneratedReview = (review: ProductReview) =>
    generatedNames.has(review.name) && generatedComments.some((createComment) => createComment(title) === review.comment);

  return reviews.filter((review) => !legacyComments.has(review.comment) && !isGeneratedReview(review));
}

export function getProductHighlights(product: Product): { title: string; description: string }[] {
  const detailedHighlights = product.detailedFeatures?.map(({ title, desc }) => ({ title, description: desc })) || [];
  const featureHighlights = product.features.map((feature, index) => ({
    title: `ميزة ${index + 1}`,
    description: feature
  }));
  const highlights = detailedHighlights.length > 0 ? detailedHighlights : featureHighlights;

  return highlights.slice(0, 3);
}