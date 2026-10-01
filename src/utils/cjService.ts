import { CJ_CONFIG, getCjHeaders } from './cjConfig';
import { Product } from '../types';

export interface CjProductItem {
  pid: string;
  productName: string;
  productImage: string;
  productImageOsg: string;
  productPrice: number;
  productSku: string;
  productWeight: number;
  categoryName: string;
}

export interface FetchCjProductsParams {
  keyword?: string;
  sku?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface CjFetchResult {
  list: CjProductItem[];
  pageNum: number;
  pageSize: number;
  total?: number;
  isSimulated?: boolean;
}

// جلب قائمة المنتجات عبر السيرفر المحلي والربط بالـ Proxy لتجاوز الـ CORS بدون أي بيانات وهمية
export async function fetchCjProducts({
  keyword = '',
  sku = '',
  pageNum = 1,
  pageSize = 20
}: FetchCjProductsParams = {}): Promise<CjFetchResult | null> {
  const params = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: String(pageSize),
    ...(keyword && { searchKey: keyword }),
    ...(sku && { productSku: sku }),
  });

  const response = await fetch(`/api/cj/products?${params.toString()}`, {
    method: 'GET',
    headers: getCjHeaders(),
  });

  if (!response.ok) {
    throw new Error('فشل جلب قائمة المنتجات من خادم CJ');
  }

  const data = await response.json();
  if (data.result && data.code === 200) {
    const list = Array.isArray(data.data?.list)
      ? data.data.list.map((item: any) => ({
          pid: item.pid || item.productId || '',
          productName: item.productName || item.productNameEn || '',
          productImage: item.productImage || item.productImageOsg || item.bigImage || '',
          productImageOsg: item.productImageOsg || item.productImage || item.bigImage || '',
          productPrice: Number(item.productPrice || item.price || item.sellPrice || 0),
          productSku: item.productSku || '',
          productWeight: Number(item.productWeight || 0),
          categoryName: item.categoryName || '',
        }))
      : [];

    return {
      list,
      pageNum: data.data?.pageNum || pageNum,
      pageSize: data.data?.pageSize || pageSize,
      total: data.data?.total || 0,
      isSimulated: false
    };
  } else {
    throw new Error(data.message || 'خطأ في استجابة خادم CJ Dropshipping');
  }
}

// جلب تفاصيل منتج معين بالـ Product ID / PID عبر البروكسي المحلي مع إلغاء أي بيانات وهمية (Mock Data) كلياً
export async function getCjProductDetails(productId: string): Promise<any | null> {
  const cleanId = String(productId).trim();
  const response = await fetch(`/api/cj/product/detail?pid=${cleanId}`, {
    method: 'GET',
    headers: getCjHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'تعذر العثور على المنتج في قاعدة بيانات CJ Dropshipping');
  }

  const data = await response.json();
  if (data.result && data.code === 200 && data.data) {
    return data.data;
  } else {
    throw new Error(data.message || 'لم يتم العثور على هذا المنتج، يرجى التحقق من الكود أو الـ SKU');
  }
}

export async function importCjProductToStore(cjItem: CjProductItem, multiplier = 2.5): Promise<Product> {
  const calculatedPrice = Math.round(cjItem.productPrice * multiplier * 3.75); // Multiply by 3.75 to convert USD to SAR + multiplier markup
  const oldPrice = Math.round(calculatedPrice * 1.5);

  const productData: Omit<Product, 'id'> = {
    title: cjItem.productName,
    subtitle: `منتج عالي الجودة مستورد ومضمون من CJ Dropshipping`,
    price: calculatedPrice || 149,
    oldPrice: oldPrice || 299,
    image: cjItem.productImage || '',
    images: cjItem.productImageOsg ? [cjItem.productImageOsg] : [],
    category: 'electronics',
    description: `منتج ${cjItem.productName} الفاخر والمميز. مستورد خصيصاً لعملائنا في المملكة بضمان جودة عالية وتوصيل سريع لباب المنزل ودفع نقداً عند المعاينة والاستلام.`,
    features: [
      'جودة تصنيع ممتازة ومضمونة',
      'سهل وعملي للاستخدام اليومي',
      'توصيل سريع مجاني لباب منزلك',
      'الدفع نقداً عند استلام المنتج ومعاينته'
    ],
    inStock: true,
    isBestSeller: true,
    badge: '🔥 منتج مستورد مميز',
    stockStatus: 'متوفر',
    heroHeadline: `اقتني ${cjItem.productName} الفاخر الآن بخصم خاص`,
    heroSubtext: 'استمتع بجودة استثنائية وتوصيل مجاني لباب منزلك في المملكة والدفع عند الاستلام.',
    bgGradient: 'from-slate-900 via-indigo-950 to-blue-950',
    detailedFeatures: [
      { title: 'جودة عالمية مضمونة', desc: 'منتج أصلي خاضع لمعايير الجودة العالمية ومستورد من أفضل المصانع.', icon: 'ShieldCheck' },
      { title: 'دفع آمن عند الاستلام', desc: 'لا تدفع أي مبلغ مسبقاً، تفقد جودة المنتج أولاً ثم ادفع.', icon: 'Truck' },
      { title: 'توصيل سريع مجاني', desc: 'شحن سريع ومجاني لكافة مدن ومناطق المملكة خلال 24-48 ساعة.', icon: 'Clock' }
    ],
    specs: {
      'الشركة المصنعة': 'CJ Dropshipping',
      'كود SKU': cjItem.productSku,
      'طريقة الدفع': 'الدفع عند الاستلام'
    },
    cjProductId: cjItem.pid,
    cjProductSku: cjItem.productSku || undefined
  };

  const { saveCustomProduct } = await import('./productStorage');
  return saveCustomProduct(productData);
}
