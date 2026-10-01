import React from 'react';
import { Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOrderClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOrderClick,
}) => {
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
      
      {/* Image & Badges */}
      <div 
        onClick={() => onOrderClick(product)}
        className="relative aspect-[3/2] cursor-pointer overflow-hidden bg-white sm:aspect-[4/3] sm:p-1"
      >
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full scale-125 object-contain object-center transition-transform duration-500 group-hover:scale-[1.3] sm:scale-110 sm:group-hover:scale-[1.13]"
          referrerPolicy="no-referrer"
        />
      </div>

      {(discountPercent > 0 || product.isBestSeller) && (
        <div dir="ltr" className="grid h-7 grid-cols-2 items-center px-2 sm:h-8">
          {product.isBestSeller && (
            <span dir="rtl" className="flex items-center gap-1 justify-self-start rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
              <Zap className="h-3 w-3 fill-white" /> الأكثر طلباً
            </span>
          )}
          {discountPercent > 0 && (
            <span dir="rtl" className="justify-self-end rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
              تخفيض -{discountPercent}%
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-2 sm:p-3">
        <h3 className="mb-1 line-clamp-3 break-words text-xs font-bold leading-[1.3] text-slate-900 sm:mb-2 sm:text-sm sm:leading-snug">
          {product.title}
        </h3>

        <div className="mt-auto">
          {/* Price */}
          <div className="mb-1 flex items-center justify-between gap-2 border-t border-slate-100 pt-1 whitespace-nowrap sm:mb-2 sm:pt-2">
            <span className="shrink-0 text-base font-black text-indigo-600 sm:text-xl">
              {product.price} <span className="text-xs sm:text-base font-bold">ر.س</span>
            </span>
            {product.oldPrice && (
              <span className="shrink-0 text-[11px] font-extrabold text-slate-700 line-through decoration-rose-600 decoration-2 sm:text-sm">
                {product.oldPrice} ر.س
              </span>
            )}
          </div>

          <button
            onClick={() => onOrderClick(product)}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-indigo-700 sm:h-10 sm:text-sm"
          >
            <Zap className="h-4 w-4 fill-white" />
            اطلب الآن
          </button>
        </div>
      </div>
    </div>
  );
};
