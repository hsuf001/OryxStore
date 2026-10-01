import React from 'react';
import { ShoppingBag, PhoneCall, Store, Home, Menu, X } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 lg:h-24">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3.5 lg:gap-5 cursor-pointer group" onClick={() => onViewChange('home')}>
            <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-950/30 border border-indigo-500/30 text-white group-hover:scale-105 transition-all">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 rounded-2xl"></div>
              <ShoppingBag className="w-5 h-5 text-amber-400 relative z-10" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-xs"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 bg-clip-text text-transparent">
                  ORYX
                </span>
                <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                  STORE
                </span>
              </div>
              <span className="block text-xs lg:text-sm font-bold text-indigo-600 tracking-wider uppercase">
                Saudi E-Commerce Hub
              </span>
            </div>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-3 bg-slate-100/80 p-1.5 lg:p-2 rounded-full border border-slate-200/60">
            <button
              onClick={() => onViewChange('home')}
              className={`flex items-center gap-2 lg:gap-2.5 px-5 lg:px-7 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-bold transition-all ${
                currentView === 'home'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4 lg:w-5 lg:h-5" />
              الرئيسية
            </button>

            <button
              onClick={() => onViewChange('store')}
              className={`flex items-center gap-2 lg:gap-2.5 px-5 lg:px-7 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-bold transition-all ${
                currentView === 'store'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Store className="w-4 h-4 lg:w-5 lg:h-5" />
              المتجر
            </button>

            <button
              onClick={() => onViewChange('contact')}
              className={`flex items-center gap-2 lg:gap-2.5 px-5 lg:px-7 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-bold transition-all ${
                currentView === 'contact'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <PhoneCall className="w-4 h-4 lg:w-5 lg:h-5" />
              اتصل بنا
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-indigo-600"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => { onViewChange('home'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
              currentView === 'home' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-5 h-5" /> الصفحة الرئيسية
          </button>
          <button
            onClick={() => { onViewChange('store'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
              currentView === 'store' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Store className="w-5 h-5" /> المتجر
          </button>
          <button
            onClick={() => { onViewChange('contact'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
              currentView === 'contact' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PhoneCall className="w-5 h-5" /> اتصل بنا
          </button>
        </div>
      )}
    </header>
  );
};
