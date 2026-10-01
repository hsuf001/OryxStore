import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const items: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      const prod = docSnap.data() as Product;
      // Purge legacy default mock products permanently
      if (prod.id !== 'oryx-cooking-bundle' && prod.id !== 'oryx-airfryer-paper') {
        items.push(prod);
      } else {
        deleteDoc(doc(db, PRODUCTS_COLLECTION, prod.id));
      }
    });

    MOCK_PRODUCTS.length = 0;
    MOCK_PRODUCTS.push(...items);
    return items;
  } catch (e) {
    console.error('Error fetching products from Firestore:', e);
  }
  return MOCK_PRODUCTS;
}

function cleanUndefined(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanUndefined(val);
    }
  }
  return cleaned;
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const sanitized = cleanUndefined(product);
    await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), sanitized);
  } catch (e) {
    console.error('Error saving product to Firestore:', e);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (e) {
    console.error('Error deleting product from Firestore:', e);
  }
}

export function getSavedProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export async function saveCustomProductAsync(product: Omit<Product, 'id'>): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const newProduct: Product = {
    ...product,
    id,
    images: product.images || [],
    heroHeadline: product.heroHeadline || product.title,
    heroSubtext: product.heroSubtext || product.description,
    bgGradient: product.bgGradient || 'from-indigo-900 via-slate-900 to-black',
    badge: product.badge || '🔥 عرض خاص في السعودية',
    detailedFeatures: product.detailedFeatures || [
      { title: 'جودة أصلية مضمونة', desc: 'منتج معتمد وعالي الجودة مطابق للمواصفات.', icon: 'ShieldCheck' },
      { title: 'دفع عند الاستلام', desc: 'لا تقم بأي دفع مسبق، تفقد المنتج أولاً.', icon: 'Truck' },
      { title: 'توصيل سريع 24-48 ساعة', desc: 'نصلك أينما كنت في جميع مناطق المملكة.', icon: 'Clock' },
    ],
    reviews: product.reviews || []
  };
  MOCK_PRODUCTS.unshift(newProduct);
  await saveProductToFirestore(newProduct);
  return newProduct;
}

export function saveCustomProduct(product: Omit<Product, 'id'>): Product {
  const id = `prod-${Date.now()}`;
  const newProduct: Product = {
    ...product,
    id,
    images: product.images || [],
    heroHeadline: product.heroHeadline || product.title,
    heroSubtext: product.heroSubtext || product.description,
    bgGradient: product.bgGradient || 'from-indigo-900 via-slate-900 to-black',
    badge: product.badge || '🔥 عرض خاص في السعودية',
    detailedFeatures: product.detailedFeatures || [
      { title: 'جودة أصلية مضمونة', desc: 'منتج معتمد وعالي الجودة مطابق للمواصفات.', icon: 'ShieldCheck' },
      { title: 'دفع عند الاستلام', desc: 'لا تقم بأي دفع مسبق، تفقد المنتج أولاً.', icon: 'Truck' },
      { title: 'توصيل سريع 24-48 ساعة', desc: 'نصلك أينما كنت في جميع مناطق المملكة.', icon: 'Clock' },
    ],
    reviews: product.reviews || []
  };
  MOCK_PRODUCTS.unshift(newProduct);
  saveProductToFirestore(newProduct);
  return newProduct;
}

export async function updateProductAsync(updatedProduct: Product): Promise<Product[]> {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === updatedProduct.id);
  if (idx !== -1) {
    MOCK_PRODUCTS[idx] = updatedProduct;
  }
  await saveProductToFirestore(updatedProduct);
  return [...MOCK_PRODUCTS];
}

export function updateProduct(updatedProduct: Product): Product[] {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === updatedProduct.id);
  if (idx !== -1) {
    MOCK_PRODUCTS[idx] = updatedProduct;
  }
  saveProductToFirestore(updatedProduct);
  return [...MOCK_PRODUCTS];
}

export async function deleteProductAsync(productId: string): Promise<Product[]> {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === productId);
  if (idx !== -1) {
    MOCK_PRODUCTS.splice(idx, 1);
  }
  await deleteProductFromFirestore(productId);
  return [...MOCK_PRODUCTS];
}

export function deleteProduct(productId: string): Product[] {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === productId);
  if (idx !== -1) {
    MOCK_PRODUCTS.splice(idx, 1);
  }
  deleteProductFromFirestore(productId);
  return [...MOCK_PRODUCTS];
}

export async function deleteProductsAsync(productIds: string[]): Promise<Product[]> {
  const filtered = MOCK_PRODUCTS.filter(p => !productIds.includes(p.id));
  MOCK_PRODUCTS.length = 0;
  MOCK_PRODUCTS.push(...filtered);
  for (const id of productIds) {
    await deleteProductFromFirestore(id);
  }
  return [...MOCK_PRODUCTS];
}

export function deleteProducts(productIds: string[]): Product[] {
  const filtered = MOCK_PRODUCTS.filter(p => !productIds.includes(p.id));
  MOCK_PRODUCTS.length = 0;
  MOCK_PRODUCTS.push(...filtered);
  productIds.forEach(id => deleteProductFromFirestore(id));
  return [...MOCK_PRODUCTS];
}

export function resetProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export function exportProductsJson(): string {
  return JSON.stringify(MOCK_PRODUCTS, null, 2);
}

export async function importProductsJsonAsync(jsonString: string): Promise<Product[]> {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      MOCK_PRODUCTS.length = 0;
      MOCK_PRODUCTS.push(...parsed);
      for (const p of parsed) {
        await saveProductToFirestore(p);
      }
      return MOCK_PRODUCTS;
    }
  } catch (e) {
    console.error('Invalid JSON', e);
  }
  return MOCK_PRODUCTS;
}

export function importProductsJson(jsonString: string): Product[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      MOCK_PRODUCTS.length = 0;
      MOCK_PRODUCTS.push(...parsed);
      parsed.forEach(p => saveProductToFirestore(p));
      return MOCK_PRODUCTS;
    }
  } catch (e) {
    console.error('Invalid JSON', e);
  }
  return MOCK_PRODUCTS;
}
