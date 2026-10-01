import React, { useState, useEffect } from 'react';
import { Product, ViewMode } from '../types';
import { getSavedProducts, deleteProduct, deleteProducts, resetProducts, saveCustomProduct, updateProduct, exportProductsJson, importProductsJson } from '../utils/productStorage';
import { Plus, Trash2, ArrowRight, Eye, Sparkles, ShieldCheck, CheckCircle, Package, RefreshCcw, Image as ImageIcon, Edit3, X, Download, Upload, Search, Globe, ChevronRight, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchCjProducts, importCjProductToStore, CjProductItem } from '../utils/cjService';
import { AdminProductImporter } from './AdminProductImporter';
import { storeVideoBlob } from '../utils/videoDb';

interface LandingPagesAdminViewProps {
  onNavigate: (view: ViewMode, productId?: string) => void;
}

export const LandingPagesAdminView: React.FC<LandingPagesAdminViewProps> = ({ onNavigate }) => {
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // CJ Dropshipping state
  const [isCjModalOpen, setIsCjModalOpen] = useState(false);
  const [cjSearchQuery, setCjSearchQuery] = useState('');
  const [cjProducts, setCjProducts] = useState<CjProductItem[]>([]);
  const [isCjLoading, setIsCjLoading] = useState(false);
  const [cjMarkup, setCjMarkup] = useState('2.5');

  const handleSearchCj = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCjLoading(true);
    try {
      const results = await fetchCjProducts({ keyword: cjSearchQuery });
      if (results && Array.isArray(results.list)) {
        setCjProducts(results.list);
      } else {
        setCjProducts([]);
      }
    } catch (err) {
      console.error(err);
      setCjProducts([]);
    } finally {
      setIsCjLoading(false);
    }
  };

  const handleImportCj = async (item: CjProductItem) => {
    try {
      await importCjProductToStore(item, Number(cjMarkup) || 2.5);
      setSuccessMsg(`تم استيراد المنتج "${item.productName.substring(0, 30)}..." بنجاح وتوفيره بالمتجر بالريال السعودي!`);
      refreshData();
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert('حدث خطأ أثناء استيراد المنتج من CJ Dropshipping');
    }
  };

  // Product & Landing Page Form state (Add / Edit)
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('199');
  const [prodOldPrice, setProdOldPrice] = useState('399');
  const [prodImage, setProdImage] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [secondaryImages, setSecondaryImages] = useState<string[]>(['']);
  const [prodBadge, setProdBadge] = useState('🔥 عرض محدود - توصيل مجاني');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [manualVideoUploading, setManualVideoUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const prods = getSavedProducts();
    setStoreProducts(prods);
    setSelectedProductIds([]);
  };

  const handleAddSecondaryImage = () => {
    setSecondaryImages([...secondaryImages, '']);
  };

  const handleUpdateSecondaryImage = (index: number, val: string) => {
    const updated = [...secondaryImages];
    updated[index] = val;
    setSecondaryImages(updated);
  };

  const handleRemoveSecondaryImage = (index: number) => {
    setSecondaryImages(secondaryImages.filter((_, i) => i !== index));
  };

  const handleMoveSecondaryImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === secondaryImages.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const listCopy = [...secondaryImages];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;
    setSecondaryImages(listCopy);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setProdTitle(product.title);
    setProdDesc(product.description || '');
    setProdPrice(String(product.price));
    setProdOldPrice(product.oldPrice ? String(product.oldPrice) : '');
    setProdImage(product.image);
    setProdUrl(product.productUrl || '');
    setSecondaryImages(product.images && product.images.length > 0 ? [...product.images] : ['']);
    setProdBadge(product.badge || '🔥 عرض محدود - توصيل مجاني');
    setHeroHeadline(product.heroHeadline || product.title);
    setHeroSubtext(product.heroSubtext || product.description || '');
    setProdVideoUrl(product.videoUrl || '');
    setIsAddingProduct(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice) return;

    const validImages = secondaryImages.filter(url => url.trim() !== '');

    if (editingProduct) {
      const updatedProd: Product = {
        ...editingProduct,
        title: prodTitle,
        description: prodDesc,
        price: Number(prodPrice),
        oldPrice: prodOldPrice ? Number(prodOldPrice) : undefined,
        image: prodImage,
        productUrl: prodUrl.trim() || undefined,
        images: validImages,
        badge: prodBadge,
        heroHeadline: heroHeadline || prodTitle,
        heroSubtext: heroSubtext || prodDesc,
        videoUrl: prodVideoUrl.trim() || undefined,
      };
      updateProduct(updatedProd);
      setEditingProduct(null);
      setSuccessMsg('تم تعديل وتحديث معلومات المنتج بنجاح!');
    } else {
      saveCustomProduct({
        title: prodTitle,
        description: prodDesc || 'منتج أصلي عالي الجودة متوفر حصرياً مع الدفع عند الاستلام في المملكة العربية السعودية.',
        price: Number(prodPrice),
        oldPrice: prodOldPrice ? Number(prodOldPrice) : undefined,
        image: prodImage,
        productUrl: prodUrl.trim() || undefined,
        images: validImages,
        badge: prodBadge,
        heroHeadline: heroHeadline || prodTitle,
        heroSubtext: heroSubtext || prodDesc || 'اطلب الآن والدفع عند الاستلام في جميع مدن ومناطق المملكة مع توصيل سريع.',
        videoUrl: prodVideoUrl.trim() || undefined,
        stockStatus: 'in_stock',
        category: 'عام',
        features: ['توصيل سريع مجاني', 'ضمان الجودة والاستبدال', 'دفع عند الاستلام'],
        specs: { 'البلد': 'المملكة العربية السعودية', 'الجودة': 'أصلية 100%' }
      });
      setIsAddingProduct(false);
      setSuccessMsg('تمت إضافة المنتج بنجاح إلى المتجر!');
    }

    refreshData();
    setProdTitle('');
    setProdDesc('');
    setHeroHeadline('');
    setHeroSubtext('');
    setProdUrl('');
    setSecondaryImages(['']);
    setProdVideoUrl('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === storeProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(storeProducts.map(p => p.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    deleteProducts(selectedProductIds);
    refreshData();
    setSelectedProductIds([]);
    setIsBulkDeleteConfirmOpen(false);
    setSuccessMsg(`تم حذف المنتجات المحددة بنجاح.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDeleteId(id);
  };

  const confirmSingleDelete = () => {
    if (!productToDeleteId) return;
    deleteProduct(productToDeleteId);
    refreshData();
    setProductToDeleteId(null);
    setSuccessMsg('تم حذف المنتج بنجاح.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetProducts = () => {
    resetProducts();
    refreshData();
    setSuccessMsg('تمت استعادة منتجات المتجر الافتراضية بنجاح.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleExportJson = () => {
    const jsonStr = exportProductsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oryx-products-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('تم تصدير ملف المنتجات بنجاح!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importProductsJson(content);
          refreshData();
          setSuccessMsg('تم استيراد المنتجات بنجاح!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-medium text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة تحكم المشرف (إدارة وتعديل وحذف منتجات المتجر)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-500" />
              إدارة منتجات المتجر وصفحات الهبوط ({storeProducts.length})
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-orders')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700"
            >
              <ArrowRight className="w-4 h-4" />
              لوحة طلبات المتجر
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700"
            >
              الرئيسية
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions Bar (Select All, Bulk Delete, Add, Export/Import, Reset) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSelectAll}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700"
            >
              {selectedProductIds.length === storeProducts.length && storeProducts.length > 0 ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
            {selectedProductIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                حذف المنتجات المحددة ({selectedProductIds.length})
              </button>
            )}

            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              title="تصدير جميع المنتجات إلى ملف JSON لحفظها ودعم النشر"
            >
              <Download className="w-4 h-4" />
              تصدير المنتجات (JSON)
            </button>

            <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow">
              <Upload className="w-4 h-4" />
              استيراد المنتجات
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setIsCjModalOpen(true);
                handleSearchCj(); // Auto-load initial list on open
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 text-sm"
            >
              <Globe className="w-5 h-5 text-indigo-200" />
              استيراد من CJ Dropshipping
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddingProduct(!isAddingProduct);
                setProdTitle('');
                setProdDesc('');
                setHeroHeadline('');
                setHeroSubtext('');
                setProdImage('');
                setProdUrl('');
                setSecondaryImages(['']);
                setProdVideoUrl('');
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              {isAddingProduct ? 'إلغاء' : 'إضافة منتج / لاندينغ باج جديدة'}
            </button>
            <button
              onClick={handleResetProducts}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700"
            >
              <RefreshCcw className="w-4 h-4 text-amber-400" />
              استعادة الافتراضية
            </button>
          </div>
        </div>

        {/* Add / Edit Product Modal or Form */}
        {(isAddingProduct || editingProduct) && (
          <form onSubmit={handleSaveProduct} className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {editingProduct ? `تعديل معلومات المنتج: ${editingProduct.title}` : 'إضافة منتج جديد مع صفحة هبوط مدمجة'}
              </h3>
              <button
                type="button"
                onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">عنوان المنتج / صفحة الهبوط *</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => {
                    setProdTitle(e.target.value);
                    if (!heroHeadline) setHeroHeadline(e.target.value);
                  }}
                  placeholder="مثال: ساعة ذكية رياضية Ultra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">رابط الصورة الرئيسية (Main Image URL) *</label>
                <input
                  type="url"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="أدخل رابط صورة المنتج الحقيقية (https://...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">رابط المنتج لدى المورد (اختياري)</label>
                <input
                  type="url"
                  value={prodUrl}
                  onChange={(e) => setProdUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">السعر الحالي (بالريال) *</label>
                <input
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="199"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">السعر القديم / قبل التخفيض (اختياري)</label>
                <input
                  type="number"
                  value={prodOldPrice}
                  onChange={(e) => setProdOldPrice(e.target.value)}
                  placeholder="399"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">شارة العرض (Badge)</label>
                <input
                  type="text"
                  value={prodBadge}
                  onChange={(e) => setProdBadge(e.target.value)}
                  placeholder="🔥 عرض خاص - توصيل مجاني"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">العنوان الرئيسي لصفحة الهبوط (Hero Headline)</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="مثال: امتلك المنتج الأكثر طلباً..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            {/* Unified Media Section (Secondary Images and Promo Video next to each other) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> روابط الصور الفرعية والفيديو الترويجي (اختياري)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSecondaryImage}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة صورة فرعية (+)
                  </button>
                  
                  <input
                    type="file"
                    accept="video/*"
                    id="manual-video-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setManualVideoUploading(true);
                        try {
                          const videoId = `video-${Date.now()}`;
                          const dbUrl = await storeVideoBlob(videoId, file);
                          setProdVideoUrl(dbUrl);
                        } catch (err) {
                          alert('حدث خطأ أثناء حفظ الفيديو في الذاكرة المخصصة للمتصفح');
                        } finally {
                          setManualVideoUploading(false);
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="manual-video-upload"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition select-none shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {manualVideoUploading ? 'جاري التحويل...' : 'تحميل فيديو ترويجي 📤'}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Secondary Images List */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-400">روابط الصور الفرعية المضافة:</span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {secondaryImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => {
                          setDraggedIndex(idx);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDragEnter={(e) => {
                          if (draggedIndex !== null && draggedIndex !== idx) {
                            const listCopy = [...secondaryImages];
                            const draggedItem = listCopy[draggedIndex];
                            listCopy.splice(draggedIndex, 1);
                            listCopy.splice(idx, 0, draggedItem);
                            setSecondaryImages(listCopy);
                            setDraggedIndex(idx);
                          }
                        }}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                        }}
                        className={`flex items-center gap-1.5 p-1 rounded-xl transition-all ${
                          draggedIndex === idx ? 'bg-indigo-600/20 border border-dashed border-indigo-500 scale-[1.01]' : 'border border-transparent'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="cursor-grab text-slate-500 hover:text-slate-300 p-1 shrink-0" title="اسحب لترتيب الصورة">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Up & Down arrow helpers */}
                        <div className="flex flex-col shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSecondaryImage(idx, 'up')}
                            className="p-0.5 text-slate-500 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-slate-500 transition"
                            title="ترقية لأعلى"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === secondaryImages.length - 1}
                            onClick={() => handleMoveSecondaryImage(idx, 'down')}
                            className="p-0.5 text-slate-500 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-slate-500 transition"
                            title="تخفيض لأسفل"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <input
                          type="url"
                          value={imgUrl}
                          onChange={(e) => handleUpdateSecondaryImage(idx, e.target.value)}
                          placeholder={`رابط الصورة الفرعية رقم ${idx + 1} (https://...)`}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                        />
                        {secondaryImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSecondaryImage(idx)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Link Input & Status */}
                <div className="space-y-2 border-t md:border-t-0 md:border-r border-slate-800/80 pt-3 md:pt-0 md:pr-4">
                  <span className="block text-[11px] font-bold text-slate-400">رابط الفيديو الترويجي (MP4 أو يوتيوب):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prodVideoUrl}
                      onChange={(e) => setProdVideoUrl(e.target.value)}
                      placeholder="https://... رابط فيديو MP4 مباشر أو يوتيوب"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    {prodVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setProdVideoUrl('')}
                        className="px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition"
                      >
                        حذف
                      </button>
                    )}
                  </div>

                  {prodVideoUrl && (
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20 mt-1 animate-fade-in">
                      <span>✓ تم تجهيز الفيديو بنجاح وجاهز للنشر!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">وصف المنتج / تفاصيل صفحة الهبوط</label>
              <textarea
                rows={3}
                value={prodDesc}
                onChange={(e) => {
                  setProdDesc(e.target.value);
                  if (!heroSubtext) setHeroSubtext(e.target.value);
                }}
                placeholder="اكتب تفاصيل المنتج ومميزاته التي ستظهر في المتجر وصفحة الهبوط..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
              >
                {editingProduct ? 'حفظ التعديلات' : 'حفظ ونشر المنتج في المتجر'}
              </button>
            </div>
          </form>
        )}

        {/* Products Grid with Checkboxes and Edit/Delete buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <div
                key={product.id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition shadow-xl relative ${
                  isSelected ? 'border-amber-500 ring-2 ring-amber-500/30 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-4 right-4 z-10 flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectProduct(product.id)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer shadow"
                    title="تحديد للحذف الجماعي"
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {product.badge && (
                      <span className="absolute bottom-2 right-2 text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-md shadow">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{product.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-lg font-black text-amber-400">{product.price} ر.س</span>
                      {product.oldPrice && (
                        <span className="text-xs text-slate-500 line-through mr-2">{product.oldPrice} ر.س</span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      متوفر {product.images && product.images.length > 0 ? `(${product.images.length + 1} صور)` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate('landing-detail', product.id)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-xs font-semibold flex items-center gap-1 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
                      title="تعديل المنتج"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition border border-rose-500/20 text-xs font-semibold flex items-center gap-1"
                      title="حذف المنتج"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {storeProducts.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">لا توجد منتجات في المتجر حالياً.</p>
            <button
              onClick={handleResetProducts}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              استعادة المنتجات الافتراضية
            </button>
          </div>
        )}

        {/* Custom Confirmation Modals */}
        {isBulkDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-right">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-2 text-center">
                <h4 className="text-xl font-bold text-white">تأكيد الحذف الجماعي</h4>
                <p className="text-sm text-slate-400">
                  هل أنت متأكد من رغبتك في حذف <span className="text-rose-400 font-extrabold">{selectedProductIds.length}</span> منتجات محددة نهائياً من المتجر؟
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteConfirmOpen(false)}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/20"
                >
                  نعم، احذف المحدد 🗑️
                </button>
              </div>
            </div>
          </div>
        )}

        {productToDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-right">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-2 text-center">
                <h4 className="text-xl font-bold text-white">تأكيد حذف المنتج</h4>
                <p className="text-sm text-slate-400">
                  هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDeleteId(null)}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmSingleDelete}
                  className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/20"
                >
                  نعم، احذف المنتج 🗑️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CJ Dropshipping Import Modal */}
        {isCjModalOpen && (
          <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" dir="rtl">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      مستورد المنتجات التلقائي من CJ Dropshipping 🇸🇦
                    </h3>
                    <p className="text-xs text-slate-400">ابحث عن ملايين المنتجات من منصة CJ واستوردها لمتجرك بالريال السعودي وبصفحة هبوط مخصصة فوراً</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCjModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct ID/SKU Importer Section */}
              <AdminProductImporter onProductImported={() => {
                refreshData();
                setSuccessMsg('تم استيراد المنتج بنجاح ونشره بمتجر Oryx!');
                setTimeout(() => setSuccessMsg(''), 4500);
              }} />

              <div className="border-t border-slate-800/80 pt-4">
                <h4 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                  <span>أو البحث العام وتصفح المنتجات:</span>
                </h4>
              </div>

              {/* Search & Pricing Markup Settings */}
              <form onSubmit={handleSearchCj} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="md:col-span-6 relative">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">ابحث عن منتجات بالاسم الإنجليزي (مثل Smart Watch, Humidifier):</label>
                  <div className="relative">
                    <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={cjSearchQuery}
                      onChange={(e) => setCjSearchQuery(e.target.value)}
                      placeholder="ابحث في ملايين المنتجات..."
                      className="w-full pr-10 pl-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-amber-400 mb-1.5">هامش الربح ومضاعف السعر (Markup):</label>
                  <select
                    value={cjMarkup}
                    onChange={(e) => setCjMarkup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white font-bold"
                  >
                    <option value="1.5">1.5x (أرباح منخفضة)</option>
                    <option value="2.0">2.0x (أرباح متوازنة)</option>
                    <option value="2.5">2.5x (أرباح ممتازة - موصى به)</option>
                    <option value="3.0">3.0x (أرباح عالية جداً)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={isCjLoading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    {isCjLoading ? 'جاري البحث...' : 'ابحث الآن 🔍'}
                  </button>
                </div>
              </form>

              {/* Products Display Container */}
              <div className="space-y-4">
                {isCjLoading ? (
                  <div className="text-center py-20 space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-400">جاري جلب وقراءة المنتجات المتوفرة من منصة CJ Dropshipping...</p>
                  </div>
                ) : cjProducts.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <Globe className="w-12 h-12 text-slate-700 mx-auto" />
                    <h4 className="font-bold text-slate-400 text-sm">ابدأ بالبحث عن منتجاتك المفضلة</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">اكتب أي كلمة بالإنجليزية وانقر ابحث لجلب المنتجات والأسعار الحية فورا بالريال السعودي</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {cjProducts.map((item) => {
                      const calculatedPriceInSar = Math.round(item.productPrice * Number(cjMarkup) * 3.75);
                      return (
                        <div
                          key={item.pid}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between gap-4 hover:border-indigo-500 transition shadow-lg group"
                        >
                          <div className="space-y-3">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                              <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                                {item.categoryName || 'إلكترونيات'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed" title={item.productName}>
                                {item.productName}
                              </h4>
                              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">تكلفة المنتج الأصلية:</span>
                                  <span className="text-xs text-slate-400 font-mono">${item.productPrice.toFixed(2)} USD</span>
                                </div>
                                <div className="text-left">
                                  <span className="text-[10px] text-amber-400 font-bold block">سعر البيع بمتجرك:</span>
                                  <span className="text-sm text-emerald-400 font-black">{calculatedPriceInSar} ر.س</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleImportCj(item)}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <Download className="w-3.5 h-3.5" />
                            استورد وانشر بصفحة هبوط مخصصة
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => setIsCjModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-medium transition"
                >
                  إغلاق النافذة
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
