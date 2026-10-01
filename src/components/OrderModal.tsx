import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, Phone, User, MapPin, Building2, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { createProductSnapshot, saveOrder } from '../utils/orderStorage';

interface OrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
  onOrderComplete: () => void;
  cartItems?: { product: Product; quantity: number }[];
}

const SAUDI_CITIES = [
  'الرياض (Riyadh)',
  'جدة (Jeddah)',
  'الدمام (Dammam)',
  'مكة المكرمة (Makkah)',
  'المدينة المنورة (Madinah)',
  'الخبر (Al Khobar)',
  'تبوك (Tabuk)',
  'أبها (Abha)',
  'خميس مشيط (Khamis Mushait)',
  'بريدة (Buraidah)',
  'حائل (Hail)',
  'الطائف (Taif)',
  'الأحساء (Al Ahsa)',
  'نجران (Najran)',
  'الجبيل (Jubail)',
  'جازان (Jazan)',
  'مدينة أخرى (Other City)'
];

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
  onOrderComplete,
  cartItems = []
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');

  if (!isOpen) return null;

  const isCartCheckout = !product && cartItems.length > 0;
  const totalPrice = isCartCheckout
    ? cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    : (product ? product.price * quantity : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('الرجاء إدخال الاسم، رقم الهاتف والعنوان بالتفصيل');
      return;
    }

    if (isCartCheckout) {
      const orderCodes = cartItems.map(item => {
        const saved = saveOrder({
          productId: item.product.id,
          productTitle: item.product.title,
          productUrl: item.product.productUrl,
          productSnapshot: createProductSnapshot(item.product),
          price: item.product.price,
          quantity: item.quantity,
          fullName,
          phone,
          city,
          address,
          notes
        });
        return saved.id;
      });
      setCreatedOrderCode(orderCodes.join(', '));
    } else if (product) {
      const saved = saveOrder({
        productId: product.id,
        productTitle: product.title,
        productUrl: product.productUrl,
        productSnapshot: createProductSnapshot(product),
        price: product.price,
        quantity,
        fullName,
        phone,
        city,
        address,
        notes
      });
      setCreatedOrderCode(saved.id);
    }

    setSubmitted(true);
    onOrderSuccess();
  };

  const handleClose = () => {
    if (submitted) onOrderComplete();
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">تأكيد الطلب (الدفع عند الاستلام)</h3>
              <p className="text-sm text-indigo-100">التوصيل سريع لجميع مناطق المملكة والدفع عند استلام طلبك</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900">تم تسجيل طلبك بنجاح!</h4>
              <p className="text-sm text-slate-600">
                شكراً لثقتك بمتجر أوريكس. {isCartCheckout ? 'أرقام طلباتك هي:' : 'رقم الطلب الخاص بك هو:'} <span className="font-bold text-indigo-600">{createdOrderCode}</span>
              </p>
              <p className="text-xs text-slate-500">
                سيتصل بك فريق خدمة العملاء قريباً لتأكيد موعد التوصيل إلى عنوانك في المملكة.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              العودة للمتجر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Product Summary */}
            {product && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{product.title}</h4>
                  <p className="text-indigo-600 font-bold text-sm mt-0.5">
                    {product.price * quantity} <span className="text-xs">ر.س</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-700 font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded text-slate-700 font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {isCartCheckout && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1"><ShoppingCart className="w-4 h-4 text-indigo-600" /> سلة المشتريات ({cartItems.length} منتجات)</span>
                  <span className="text-indigo-600 font-black text-sm">{totalPrice} ر.س</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-slate-600">
                  {cartItems.map((ci, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{ci.product.title} (x{ci.quantity})</span>
                      <span className="font-semibold">{ci.product.price * ci.quantity} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: سلطان القحطاني"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) *</label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXX أو 011XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">المدينة / المحافظة *</label>
                <div className="relative">
                  <Building2 className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  >
                    {SAUDI_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">العنوان بالتفصيل *</label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="اسم الحي، الشارع، رقم المبنى..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-2">
              <div>
                <span className="text-xs text-slate-500 block">المجموع الإجمالي:</span>
                <span className="text-2xl font-black text-indigo-600">{totalPrice} ر.س</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-bold">
                <ShieldCheck className="w-4 h-4" /> الدفع عند الاستلام
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              تأكيد الطلب الآن 🚀
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
