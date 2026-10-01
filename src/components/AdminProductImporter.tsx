import React, { useState } from 'react';
import { getCjProductDetails } from '../utils/cjService';
import { saveCustomProduct } from '../utils/productStorage';
import { Product } from '../types';
import { Globe, Download, Search, AlertCircle, Sparkles, ShieldCheck, Link as LinkIcon, Upload } from 'lucide-react';

interface AdminProductImporterProps {
  onProductImported: (product: Product) => void;
}

export const AdminProductImporter: React.FC<AdminProductImporterProps> = ({ onProductImported }) => {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [importedProduct, setImportedProduct] = useState<any | null>(null);
  const [customPriceSar, setCustomPriceSar] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editable fields for manual correction/guaranteeing consistency
  const [editableName, setEditableName] = useState('');
  const [editableImage, setEditableImage] = useState('');
  const [editableSku, setEditableSku] = useState('');
  const [editablePrice, setEditablePrice] = useState('');
  const [editableDesc, setEditableDesc] = useState('');
  const [editableVideoUrl, setEditableVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);

  const handleFetch = async () => {
    if (!productId.trim()) return;
    setLoading(true);
    setImportedProduct(null);
    setSuccessMsg('');
    setErrorMessage('');
    
    try {
      const data = await getCjProductDetails(productId.trim());
      setLoading(false);

      if (data) {
        setImportedProduct(data);
        setEditableName(data.productName || '');
        setEditableImage(data.productImage || data.productImageOsg || '');
        setEditableSku(data.productSku || '');
        setEditablePrice(String(data.sellPrice || data.price || '15.00'));
        setEditableDesc(data.description || 'منتج مستورد عالي الجودة ومميز من CJ Dropshipping.');
        setEditableVideoUrl(data.productVideo || '');

        // Convert USD sellPrice to SAR (USD * 3.75) and add standard 2.5x markup for dropshipping
        const usdPrice = parseFloat(data.sellPrice || data.price || 15.00);
        const suggestedSar = Math.ceil(usdPrice * 3.75 * 2.5);
        setCustomPriceSar(String(suggestedSar || 149));
      } else {
        setErrorMessage('لم يتم العثور على المنتج، يرجى التأكد من الـ Product ID (PID) أو الـ SKU الصحيح من منصة CJ Dropshipping.');
      }
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(error.message || 'تعذر جلب المنتج. تحقق من إعداد CJ_ACCESS_TOKEN في بيئة السيرفر.');
    }
  };

  const handleSaveToStore = () => {
    if (!importedProduct) return;

    // Remove any HTML tags from description if present
    const cleanDescription = editableDesc
      ? editableDesc.replace(/<[^>]*>/g, '').substring(0, 400)
      : `منتج عالي الجودة مستورد ومضمون من CJ Dropshipping. متوفر الآن للشراء والدفع عند الاستلام داخل مناطق المملكة العربية السعودية.`;

    // Map to Oryx standard Product format using customized values to guarantee absolute consistency!
    const newProductData: Omit<Product, 'id'> = {
      title: editableName.trim(),
      subtitle: 'منتج مستورد حقيقي عالي الجودة ومميز من CJ Dropshipping',
      price: Number(customPriceSar) || 149,
      oldPrice: Math.round((Number(customPriceSar) || 149) * 1.5),
      image: editableImage.trim() || '',
      images: editableImage.trim() ? [editableImage.trim()] : [],
      category: 'electronics',
      description: cleanDescription,
      features: [
        'جودة أصلية مضمونة ومكفولة',
        'توصيل شحن سريع مجاني لجميع مناطق المملكة',
        'الدفع نقداً بالكامل عند الاستلام والمعاينة لباب المنزل'
      ],
      inStock: true,
      isBestSeller: true,
      badge: '🔥 منتج مستورد مميز',
      stockStatus: 'متوفر',
      videoUrl: editableVideoUrl.trim() || undefined,
      cjProductId: String(importedProduct.pid || productId.trim()),
      cjProductSku: editableSku.trim() || undefined,
      heroHeadline: `اطلب ${editableName.trim()} الآن في السعودية`,
      heroSubtext: 'عرض خاص وحصري مع توصيل سريع ومجاني لباب المنزل خلال 24-48 ساعة فقط!',
      bgGradient: 'from-slate-900 via-indigo-950 to-blue-950',
      specs: {
        'الشركة المصنعة': 'مستورد CJ',
        ...(editableSku.trim() ? { 'كود SKU': editableSku.trim() } : {}),
        'طريقة الدفع': 'الدفع عند الاستلام (COD)'
      }
    };

    // Save to our custom product local storage
    const saved = saveCustomProduct(newProductData);
    onProductImported(saved);

    setSuccessMsg('تم استيراد المنتج ونشره في متجر Oryx بنجاح! 🎉');
    setImportedProduct(null);
    setProductId('');
    setEditableVideoUrl('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-100 shadow-xl" dir="rtl">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <div className="w-10 h-10 bg-indigo-500/15 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">استيراد منتج جديد من CJ Dropshipping</h3>
          <p className="text-xs text-slate-400">أدخل معرّف المنتج (PID) لجلب كافة تفاصيله وصوره وتعديله فوراً</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Input Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="أدخل Product ID (PID) أو SKU من CJ..."
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 tracking-wider font-mono text-center sm:text-right"
        />
        <button
          onClick={handleFetch}
          disabled={loading || !productId.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/15 shrink-0 cursor-pointer"
        >
          {loading ? 'جاري جلب وقراءة المنتج...' : 'جلب تفاصيل المنتج 🔍'}
        </button>
      </div>

      {/* Clickable Examples for instant testing */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
        <span className="font-bold text-amber-400">💡 أزرار سريعة للاختبار الفوري للمستورد:</span>
        <button
          type="button"
          onClick={() => setProductId('PID-11094')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-indigo-300 font-mono transition cursor-pointer"
        >
          ساعة ذكية (Ultra)
        </button>
        <button
          type="button"
          onClick={() => setProductId('PID-22481')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-indigo-300 font-mono transition cursor-pointer"
        >
          صانعة قهوة محمولة
        </button>
        <button
          type="button"
          onClick={() => setProductId('PID-33054')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-indigo-300 font-mono transition cursor-pointer"
        >
          مكنسة سيارات لاسلكية
        </button>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="bg-red-950/70 border border-red-500/30 text-red-200 p-4 rounded-xl text-xs space-y-2 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-red-300">حدث خطأ أثناء جلب المنتج:</span>
              <p className="whitespace-pre-line">{errorMessage}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-red-500/20 flex items-center justify-between">
            <span className="text-[11px] text-slate-300">إعداد مفتاح CJ يكون في بيئة السيرفر، ماشي فالمتصفح.</span>
            <a
              href="https://developers.cjdropshipping.com"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-indigo-300 hover:underline flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" /> شرح استخراج المفتاح
            </a>
          </div>
        </div>
      )}

      {/* Imported details display */}
      {importedProduct && (
        <div className="mt-4 p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-4 animate-fadeIn">
          <div className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>✨ تفاصيل الاستيراد (قابلة للتعديل والتأكيد):</span>
            <span className="text-[10px] text-slate-400">راجع البيانات وعدّلها لتتناسب 100% مع متجرك</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Image Preview & URL */}
            <div className="md:col-span-3 flex flex-col items-center justify-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 shrink-0">
              <img
                src={editableImage}
                alt="Product Preview"
                className="w-24 h-24 rounded-lg object-cover bg-slate-950 border border-slate-800 mb-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] text-slate-400 text-center font-bold">معاينة الصورة</span>
            </div>

            {/* Editable Fields */}
            <div className="md:col-span-9 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">اسم المنتج في متجر Oryx (English/Arabic):</label>
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  placeholder="أدخل عنوان المنتج..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">كود SKU الخاص بـ CJ (لربط الطلبات تلقائياً):</label>
                  <input
                    type="text"
                    value={editableSku}
                    onChange={(e) => setEditableSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
                    placeholder="كود SKU لـ CJ..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">تكلفة التوريد الأصلية من المورد ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editablePrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditablePrice(val);
                      // Update suggested price too
                      const num = parseFloat(val) || 0;
                      const suggestedSar = Math.ceil(num * 3.75 * 2.5);
                      setCustomPriceSar(String(suggestedSar || 149));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-indigo-500 text-center font-bold"
                    placeholder="مثال: 5.50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">رابط الصورة الرئيسية للمنتج (Image URL):</label>
                <input
                  type="text"
                  value={editableImage}
                  onChange={(e) => setEditableImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://..."
                />
              </div>

              {/* Video URL & Upload Section */}
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 space-y-2">
                <label className="block text-[10px] font-bold text-amber-400">🎥 فيديو المنتج (اختياري - MP4 أو يوتيوب):</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editableVideoUrl}
                    onChange={(e) => setEditableVideoUrl(e.target.value)}
                    placeholder="رابط الفيديو (https://...) أو قم بالتحميل من جهازك بالزر ←"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="video/*"
                      id="cj-video-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 15 * 1024 * 1024) {
                            alert('حجم الفيديو كبير جداً! يفضل رفع فيديو أقل من 15 ميجابايت لضمان سرعة تحميل صفحة الهبوط.');
                          }
                          setVideoUploading(true);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditableVideoUrl(reader.result as string);
                            setVideoUploading(false);
                          };
                          reader.onerror = () => {
                            alert('فشل قراءة ملف الفيديو');
                            setVideoUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="cj-video-upload"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition select-none"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {videoUploading ? 'جاري التحويل...' : 'تحميل فيديو 📤'}
                    </label>
                  </div>
                </div>
                {editableVideoUrl && (
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>✓ تم تجهيز الفيديو بنجاح!</span>
                    <button
                      type="button"
                      onClick={() => setEditableVideoUrl('')}
                      className="text-red-400 hover:text-red-300 underline font-normal mr-2"
                    >
                      حذف الفيديو
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-300 whitespace-nowrap">💰 حدد سعر البيع النهائي بمتجرك (ر.س):</label>
              <input
                type="number"
                value={customPriceSar}
                onChange={(e) => setCustomPriceSar(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-black focus:outline-none focus:border-emerald-500 w-28 text-center"
              />
            </div>

            <button
              onClick={handleSaveToStore}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              تأكيد وحفظ ونشر بمتجر Oryx 🇸🇦
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
