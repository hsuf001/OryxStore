import React from 'react';
import { ShieldCheck, Truck, Headphones, Heart, ShoppingBag } from 'lucide-react';
import { ViewMode } from '../types';

interface FooterProps {
  onViewChange: (view: ViewMode) => void;
  onSecretAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange, onSecretAdminClick }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-8 pb-6 sm:pt-16 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 pb-6 sm:pb-12 mb-6 sm:mb-12 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-right gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs leading-relaxed sm:text-base">توصيل سريع لجميع مناطق المملكة</h4>
              <p className="hidden sm:block text-sm text-slate-400">التوصيل لجميع مدن ومحافظات المملكة خلال 24 إلى 48 ساعة</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-right gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs leading-relaxed sm:text-base">الدفع عند الاستلام</h4>
              <p className="hidden sm:block text-sm text-slate-400">لا تتخلص من أموالك إلا بعد استلام طلبك ومعاينته</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-right gap-2 sm:gap-3 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs leading-relaxed sm:text-base">دعم عملاء على مدار الساعة</h4>
              <p className="hidden sm:block text-sm text-slate-400">فريق خدمة العملاء رهن إشارتكم للإجابة على جميع استفساراتكم</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-8 lg:gap-x-12 mb-6 sm:mb-12">
          <div className="col-span-3 md:col-span-2 lg:col-span-1 min-w-0 space-y-3 sm:space-y-4 text-right">
            <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-950/40 border border-indigo-500/30 text-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 rounded-2xl"></div>
                <ShoppingBag className="w-5 h-5 text-amber-400 relative z-10" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">ORYX</span>
                  <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">STORE</span>
                </div>
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Saudi E-Commerce Hub</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              منصتك الأولى للتجارة الإلكترونية والمنتجات المميزة في المملكة العربية السعودية. نضمن جودة المنتجات، سرعة التوصيل، والدفع الآمن عند الاستلام.
            </p>
          </div>

          <div className="min-w-0 text-right">
            <h5 className="font-bold text-white text-sm sm:text-base mb-2 sm:mb-4">روابط سريعة</h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => onViewChange('home')} className="hover:text-indigo-400 transition-colors">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('store')} className="hover:text-indigo-400 transition-colors">
                  المتجر الشامل
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange('contact')} className="hover:text-indigo-400 transition-colors">
                  اتصل بنا
                </button>
              </li>
            </ul>
          </div>

          <div className="min-w-0 text-right">
            <h5 className="font-bold text-white text-sm sm:text-base mb-2 sm:mb-4">فئات المنتجات</h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>إلكترونيات وإكسسوارات</li>
              <li>معدات منزلية وديكور</li>
              <li>صحة وعناية شخصية</li>
              <li>أجهزة ذكية متطورة</li>
            </ul>
          </div>

          <div className="min-w-0 text-right">
            <h5 className="font-bold text-white text-sm sm:text-base mb-2 sm:mb-4">تواصل معنا</h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>الهاتف: <a href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 font-mono" dir="ltr">+966 50 123 4567</a></li>
              <li>الواتساب: <a href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 font-mono" dir="ltr">+966 50 123 4567</a></li>
              <li className="break-words">البريد: <a href="mailto:support@oryxstore.sa" className="break-all hover:text-indigo-400 font-mono">support@oryxstore.sa</a></li>
              <li>المملكة العربية السعودية - الرياض</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p onClick={onSecretAdminClick} className="cursor-pointer select-none">
            © {new Date().getFullYear()} أوريكس ستور (Oryx Store). جميع الحقوق محفوظة.
          </p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            صنع بكل <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> للسوق السعودي
          </p>
        </div>

      </div>
    </footer>
  );
};
