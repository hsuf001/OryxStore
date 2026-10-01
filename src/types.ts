export interface ProductFeature {
  title: string;
  desc: string;
  icon: string;
}

export interface ProductReview {
  name: string;
  city: string;
  comment: string;
  rating: number;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[]; // Secondary gallery images
  category: string;
  rating?: number;
  reviewsCount?: number;
  description: string;
  features: string[];
  inStock?: boolean;
  isBestSeller?: boolean;
  badge?: string;
  stockStatus?: string;
  specs?: Record<string, string>;
  
  // Landing page properties merged directly into Product (unified 1-in-1):
  heroHeadline?: string;
  heroSubtext?: string;
  bgGradient?: string;
  customHtml?: string;
  detailedFeatures?: ProductFeature[];
  reviews?: ProductReview[];
  
  // CJ Dropshipping API fields
  cjProductId?: string;
  cjProductSku?: string;
  cjOriginalPrice?: number;
  productUrl?: string;

  videoUrl?: string;

  // Quantity Tier Bundles (e.g. 1 piece for X, 2 pieces for Y, 3 pieces for Z)
  bundles?: {
    quantity: number;
    label: string;
    totalPrice: number;
  }[];
}

export interface OrderProductSnapshot {
  title: string;
  productSku?: string;
  sourceProductId?: string;
  productUrl?: string;
  image?: string;
  description?: string;
  features?: string[];
  specs?: Record<string, string>;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productUrl?: string;
  productSnapshot?: OrderProductSnapshot;
  price: number;
  quantity: number;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  createdAt: string;
  status: 'جديد' | 'مؤكد' | 'قيد الشحن' | 'تم التوصيل' | 'ملغي';
}

export type ViewMode = 'home' | 'store' | 'landing-detail' | 'contact' | 'admin-orders' | 'admin-products';
