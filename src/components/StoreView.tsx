import React, { useState } from 'react';
import { Search, SlidersHorizontal, Store } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockProducts';
import { ProductCard } from './ProductCard';

interface StoreViewProps {
  products: Product[];
  onOrderClick: (product: Product) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  onOrderClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-100 p-8 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-800 text-xs font-bold">
            <Store className="w-4 h-4" /> متجر أوريكس الشامل
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">جميع المنتجات المتوفرة</h1>
          <p className="text-slate-600 text-sm max-w-xl">
            اكتشف تشكيلتنا الكاملة من المنتجات العالية الجودة في المملكة مع إمكانية الطلب السريع والدفع عند الاستلام.
          </p>
        </div>

        <div className="bg-white/80 px-6 py-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-2xl font-black text-indigo-700">{filteredProducts.length}</span>
          <span className="block text-xs text-slate-500">منتج متاح</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن أي منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600">ترتيب حسب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
          >
            <option value="default">الافتراضي (الأكثر طلباً)</option>
            <option value="price-asc">السعر: من الأرخص للأغلى</option>
            <option value="price-desc">السعر: من الأغلى للأرخص</option>
            <option value="rating">التقييم: الأعلى تقييماً</option>
          </select>
        </div>

      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 space-y-3 bg-white rounded-3xl border border-slate-200">
          <h3 className="font-bold text-slate-800 text-lg">لم يتم العثور على منتجات مطابقة</h3>
          <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر فئة مختلفة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderClick={onOrderClick}
            />
          ))}
        </div>
      )}

    </div>
  );
};
