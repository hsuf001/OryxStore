import React from 'react';
import { PackageSearch, Sparkles } from 'lucide-react';
import { Product, ViewMode } from '../types';
import { ProductCard } from './ProductCard';

interface HomeViewProps {
  products: Product[];
  isProductsLoading: boolean;
  onOrderClick: (product: Product) => void;
  onViewChange: (view: ViewMode, id?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  isProductsLoading,
  onOrderClick,
}) => {
  const latestProducts = products.slice(0, 12);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn sm:space-y-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#f2faf8] text-slate-900 py-6 lg:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% -15%, rgba(255,255,255,0.98), transparent 58%), radial-gradient(ellipse at 100% 100%, rgba(13,148,136,0.16), transparent 38%), radial-gradient(ellipse at 0% 18%, rgba(45,212,191,0.18), transparent 32%), linear-gradient(135deg, #f0fdfa 0%, #ffffff 48%, #eff7f5 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f766e12_1px,transparent_1px),linear-gradient(to_bottom,#0f766e12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_90%_at_50%_45%,#000_35%,transparent_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-72 h-[34rem] w-[34rem] rounded-full border-[3.5rem] border-white/45 shadow-[0_0_0_1px_rgba(13,148,136,0.08)] sm:-right-28" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-56 -bottom-[26rem] h-[38rem] w-[38rem] rounded-full border-[4rem] border-teal-700/[0.045]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-10 hidden h-2 w-2 rounded-full bg-teal-500/50 shadow-[0_0_0_8px_rgba(20,184,166,0.08)] lg:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            
            <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full text-indigo-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>منصة رائدة لمنتجات وجهات الهبوط في المملكة العربية السعودية</span>
            </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              متجر <span className="bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">أوريكس</span>: طلبك السريع بضغطة زر والدفع عند الاستلام
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
              اكتشف تشكيلة واسعة من المنتجات الحصرية المختارة بعناية لتلبي احتياجاتك اليومية مع توصيل سريع لجميع مناطق ومحافظات المملكة.
            </p>

          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">أحدث المنتجات</h2>
          <div aria-hidden="true" className="mx-auto mt-3 h-1 w-20 rounded-full bg-indigo-600 sm:mt-4" />
        </div>

        {isProductsLoading ? (
          <div role="status" className="border-y border-slate-200 py-14 text-center text-sm text-slate-500">
            جاري تحميل المنتجات...
          </div>
        ) : latestProducts.length === 0 ? (
          <div className="border-y border-slate-200 py-14 text-center">
            <PackageSearch className="w-9 h-9 mx-auto mb-3 text-slate-400" />
            <h3 className="font-bold text-slate-800">ما كايناش منتجات متاحة حاليا</h3>
            <p className="mt-1 text-sm text-slate-500">المنتجات غادي يبانوا هنا منين يتضافوا للمتجر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOrderClick={onOrderClick}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
