import React, { useState } from 'react';
import { Plus, Package, Sparkles, X, CheckCircle, Trash2, ShieldAlert, RefreshCcw, Image as ImageIcon, Edit3, Download, Upload, Search, Globe, GripVertical, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Product, ViewMode } from '../types';
import { getSavedProducts, deleteProduct, deleteProducts, resetProducts, saveCustomProduct, updateProduct, exportProductsJson, importProductsJson, saveProductToFirestore, deleteProductAsync, deleteProductsAsync } from '../utils/productStorage';
import { fetchCjProducts, importCjProductToStore, CjProductItem } from '../utils/cjService';
import { AdminProductImporter } from './AdminProductImporter';
import { storeVideoBlob } from '../utils/videoDb';

interface LandingPageAdminBarProps {
  onNavigate: (view: ViewMode, productId?: string) => void;
  onProductsChange?: () => void;
  onOpenSheetsConfig: () => void;
}

export const LandingPageAdminBar: React.FC<LandingPageAdminBarProps> = ({ onNavigate, onProductsChange, onOpenSheetsConfig }) => {
  const [storeProducts, setStoreProducts] = useState<Product[]>(getSavedProducts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
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
      setStoreProducts(getSavedProducts());
      onProductsChange?.();
      setTimeout(() => {
        setSuccessMsg('');
        window.location.reload();
      }, 1500);
    } catch (err) {
      alert('حدث خطأ أثناء استيراد المنتج من CJ Dropshipping');
    }
  };

  // Add / Edit product form state
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('199');
  const [prodOldPrice, setProdOldPrice] = useState('399');
  const [prodImage, setProdImage] = useState('');
  const [prodUrl, setProdUrl] = useState('');
  const [secondaryImages, setSecondaryImages] = useState<string[]>(['']);
  const [prodDesc, setProdDesc] = useState('');
  const [prodBadge, setProdBadge] = useState('🔥 عرض محدود - توصيل مجاني');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [manualVideoUploading, setManualVideoUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Bundles State
  const [bundles, setBundles] = useState<{ quantity: number; label: string; totalPrice: number }[]>([]);

  const handleAddBundle = () => {
    setBundles([...bundles, { quantity: bundles.length + 1, label: '', totalPrice: 0 }]);
  };

  const handleUpdateBundle = (index: number, key: 'quantity' | 'label' | 'totalPrice', val: any) => {
    const updated = [...bundles];
    updated[index] = {
      ...updated[index],
      [key]: key === 'label' ? val : Number(val) || 0
    };
    setBundles(updated);
  };

  const handleRemoveBundle = (index: number) => {
    setBundles(bundles.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setCustomHtml(content);
          if (!prodTitle) {
            setProdTitle(file.name.replace(/\.[^/.]+$/, ""));
          }
          if (!heroHeadline) {
            setHeroHeadline(file.name.replace(/\.[^/.]+$/, ""));
          }
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (imgMatch && imgMatch[1]) {
            setProdImage(imgMatch[1]);
          }
        }
      };
      reader.readAsText(file);
    }
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
    setProdPrice(String(product.price));
    setProdOldPrice(product.oldPrice ? String(product.oldPrice) : '');
    setProdImage(product.image);
    setProdUrl(product.productUrl || '');
    setSecondaryImages(product.images && product.images.length > 0 ? [...product.images] : ['']);
    setProdDesc(product.description || '');
    setProdBadge(product.badge || '🔥 عرض محدود - توصيل مجاني');
    setHeroHeadline(product.heroHeadline || product.title);
    setCustomHtml(product.customHtml || '');
    setProdVideoUrl(product.videoUrl || '');
    setBundles(product.bundles && product.bundles.length > 0 ? [...product.bundles] : []);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice) return;

    const validImages = secondaryImages.filter(url => url.trim() !== '');
    const validBundles = bundles.filter(b => b.quantity > 0 && b.totalPrice > 0);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: prodTitle,
        price: Number(prodPrice) || 199,
        oldPrice: Number(prodOldPrice) || 399,
        image: prodImage,
        productUrl: prodUrl.trim() || undefined,
        images: validImages,
        description: prodDesc,
        badge: prodBadge,
        heroHeadline: heroHeadline || prodTitle,
        heroSubtext: prodDesc,
        customHtml: customHtml || undefined,
        videoUrl: prodVideoUrl.trim() || undefined,
        bundles: validBundles.length > 0 ? validBundles : undefined
      };
      updateProduct(updated);
      setSuccessMsg('تم تعديل المنتج بنجاح!');
    } else {
      saveCustomProduct({
        title: prodTitle,
        price: Number(prodPrice) || 199,
        oldPrice: Number(prodOldPrice) || 399,
        image: prodImage,
        productUrl: prodUrl.trim() || undefined,
        images: validImages,
        category: 'electronics',
        rating: 4.9,
        reviewsCount: 140,
        description: prodDesc || 'منتج حصري عالي الجودة متوفر حصرياً عبر متجر أوريكس مع التوصيل السريع والدفع عند الاستلام في المملكة.',
        features: ['جودة أصلية مضمونة', 'توصيل سريع لجميع مدن المملكة', 'الدفع عند الاستلام'],
        inStock: true,
        isBestSeller: true,
        badge: prodBadge,
        heroHeadline: heroHeadline || prodTitle,
        heroSubtext: prodDesc || 'اطلب الآن والدفع عند الاستلام في جميع مدن ومناطق المملكة مع توصيل سريع.',
        customHtml: customHtml || undefined,
        videoUrl: prodVideoUrl.trim() || undefined,
        bundles: validBundles.length > 0 ? validBundles : undefined
      });
      setSuccessMsg('تمت إضافة المنتج وصفحة الهبوط بنجاح!');
    }

    setStoreProducts(getSavedProducts());
    onProductsChange?.();
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setProdTitle('');
    setProdDesc('');
    setHeroHeadline('');
    setProdImage('');
    setProdUrl('');
    setSecondaryImages(['']);
    setProdVideoUrl('');
    setCustomHtml('');
    setBundles([]);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveAllToCloud = async () => {
    try {
      for (const prod of storeProducts) {
        await saveProductToFirestore(prod);
      }
      onProductsChange?.();
      setSuccessMsg(`💾 تم حفظ جميع المنتجات (${storeProducts.length}) في السحابة بنجاح تام!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error('Error saving all products to cloud:', e);
      setSuccessMsg('حدث خطأ أثناء الحفظ في السحابة.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
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

  const confirmBulkDelete = async () => {
    await deleteProductsAsync(selectedProductIds);
    setStoreProducts(getSavedProducts());
    onProductsChange?.();
    setSelectedProductIds([]);
    setIsBulkDeleteConfirmOpen(false);
    setSuccessMsg('تم حذف المنتجات المحددة بنجاح.');
    setTimeout(() => {
      setSuccessMsg('');
      window.location.reload();
    }, 1500);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDeleteId(id);
  };

  const confirmSingleDelete = async () => {
    if (!productToDeleteId) return;
    const updated = await deleteProductAsync(productToDeleteId);
    setStoreProducts(updated);
    onProductsChange?.();
    setProductToDeleteId(null);
    setSuccessMsg('تم حذف المنتج بنجاح.');
    setTimeout(() => {
      setSuccessMsg('');
      window.location.reload();
    }, 1500);
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
          setStoreProducts(getSavedProducts());
          onProductsChange?.();
          setSuccessMsg('تم استيراد المنتجات بنجاح!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white px-4 py-2 border-b border-amber-500/40 text-xs shadow-md z-50 relative" dir="rtl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              لوحة التحكم السريعة (منتجات المتجر وصفحات الهبوط):
            </span>
            <span className="bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-700 text-slate-300 font-mono">
              {storeProducts.length} منتج متاح
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdTitle('');
                setProdUrl('');
                setProdDesc('');
                setHeroHeadline('');
                setSecondaryImages(['']);
                setCustomHtml('');
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة منتج / لاندينغ باج جديدة
            </button>

            <button
              onClick={handleSaveAllToCloud}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>💾 حفظ الكل في السحابة</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs flex items-center gap-1 cursor-pointer shadow"
              title="تحميل نسخة احتياطية بصيغة JSON"
            >
              <Download className="w-3.5 h-3.5" /> 📥 تحميل نسخة
            </button>

            <label
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition text-xs flex items-center gap-1 cursor-pointer shadow"
              title="استعادة المنتجات من ملف JSON احتياطي"
            >
              <Upload className="w-3.5 h-3.5" /> 📤 استعادة نسخة
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={() => {
                setIsCjModalOpen(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition flex items-center gap-1.5 text-xs cursor-pointer shadow"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
              استيراد من CJ Dropshipping
            </button>

            <button
              onClick={() => setIsManageModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg transition border border-slate-700 flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              إدارة وتعديل وحذف المنتجات ({storeProducts.length})
            </button>

            <button
              onClick={onOpenSheetsConfig}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition text-xs flex items-center gap-1.5"
            >
              📊 ربط Google Sheets
            </button>

            <button
              onClick={() => onNavigate('admin-orders')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition border border-slate-700 text-xs"
            >
              📦 الطلبات
            </button>
          </div>

        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-2 text-center text-xs font-bold border-b border-emerald-700 shadow-inner z-50 flex items-center justify-center gap-2 animate-fade-in" dir="rtl">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {editingProduct ? `تعديل المنتج: ${editingProduct.title}` : 'إضافة منتج جديد مع صفحة هبوط مدمجة'}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">اسم المنتج / عنوان العرض *</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => {
                    setProdTitle(e.target.value);
                    if (!heroHeadline) setHeroHeadline(e.target.value);
                  }}
                  placeholder="مثال: ساعة ذكية Ultra Series 9"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رابط المنتج لدى المورد (اختياري)</label>
                <input
                  type="url"
                  value={prodUrl}
                  onChange={(e) => setProdUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">السعر (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">السعر القديم (شطب)</label>
                  <input
                    type="number"
                    value={prodOldPrice}
                    onChange={(e) => setProdOldPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رابط الصورة الرئيسية (Main Image URL) *</label>
                <input
                  type="url"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
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
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة صورة (+)
                    </button>
                    
                    <input
                      type="file"
                      accept="video/*"
                      id="manual-video-upload-bar"
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
                      htmlFor="manual-video-upload-bar"
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition select-none shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {manualVideoUploading ? 'جاري التحويل...' : 'تحميل فيديو 📤'}
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
                            placeholder={`رابط الصورة الفرعية ${idx + 1} (https://...)`}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                          />
                          {secondaryImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSecondaryImage(idx)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition shrink-0"
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
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {prodVideoUrl && (
                        <button
                          type="button"
                          onClick={() => setProdVideoUrl('')}
                          className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition"
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

              {/* Quantity Bundles Configuration (عروض وباقات الكميات المخصصة) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    📦 عروض الكميات والتوفير (مثال: قطعتين بسعر خاص)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBundle}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة باقة عرض جديدة (+)
                  </button>
                </div>

                <p className="text-[10px] text-slate-400">
                  قم بإنشاء عروض تشجع الزوار على الشراء بكميات أكبر (مثال: قطعة بـ 150 ريال، قطعتين بـ 250 ريال لزيادة التوفير).
                </p>

                <div className="space-y-3">
                  {bundles.map((bundle, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 relative text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-400">العرض #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBundle(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> حذف هذا العرض
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-right">
                        {/* Quantity */}
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 text-right">الكمية (عدد القطع):</label>
                          <input
                            type="number"
                            min="1"
                            value={bundle.quantity}
                            onChange={(e) => handleUpdateBundle(idx, 'quantity', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-bold"
                          />
                        </div>

                        {/* Label */}
                        <div className="sm:col-span-5">
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 text-right">اسم العرض (الاسم المعروض للزبون):</label>
                          <input
                            type="text"
                            required
                            value={bundle.label}
                            onChange={(e) => handleUpdateBundle(idx, 'label', e.target.value)}
                            placeholder="مثال: قطعة واحدة / قطعتين (الأكثر طلباً)"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white text-right"
                          />
                        </div>

                        {/* Total Price */}
                        <div className="sm:col-span-4">
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 text-right">السعر الإجمالي للعرض (ر.س):</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={bundle.totalPrice || ''}
                            onChange={(e) => handleUpdateBundle(idx, 'totalPrice', e.target.value)}
                            placeholder="مثال: 250"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 text-center font-extrabold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {bundles.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                      <p className="text-[11px] text-slate-500">لم تقم بإضافة أي عروض كميات لهذا المنتج بعد.</p>
                      <p className="text-[10px] text-slate-600 mt-1">سيتم استخدام السعر الافتراضي مع عداد الكميات التلقائي.</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">شارة العرض (Badge)</label>
                <input
                  type="text"
                  value={prodBadge}
                  onChange={(e) => setProdBadge(e.target.value)}
                  placeholder="مثال: 🔥 تخفيض 50% لفترة محدودة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">العنوان الرئيسي لصفحة الهبوط (Headline)</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="مثال: اطلب الآن واحصل على توصيل مجاني والدفع عند الاستلام"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">وصف المنتج (Description)</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="اكتب وصفاً قصيراً مشجعاً للشراء..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Custom HTML Upload or Paste */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-amber-400">
                  ⚡ رفع ملف HTML جاهز أو لصق كود HTML (اختياري)
                </label>
                <div>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="أو الصق كود HTML هنا مباشرة..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-medium transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>{editingProduct ? 'تحديث المنتج في القائمة' : '➕ إضافة إلى قائمة المتجر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage & Delete Modal with Checkboxes, Edit & Export/Import */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Package className="w-5 h-5" />
                إدارة وتعديل وحذف منتجات المتجر ({storeProducts.length})
              </h3>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulk actions & Export/Import bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition border border-slate-700"
                >
                  {selectedProductIds.length === storeProducts.length && storeProducts.length > 0 ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </button>
                
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف المحدد ({selectedProductIds.length})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> تصدير JSON
                </button>

                <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> استيراد
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {storeProducts.length === 0 ? (
                <p className="text-center text-slate-500 py-8">لا توجد منتجات حالياً في المتجر.</p>
              ) : (
                storeProducts.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={`border rounded-2xl p-3 flex items-center justify-between gap-4 transition ${
                        isSelected ? 'bg-slate-950 border-amber-500 ring-1 ring-amber-500/30' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(prod.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
                        />
                        <img src={prod.image} alt={prod.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800" referrerPolicy="no-referrer" />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{prod.title}</h4>
                          <div className="text-xs text-amber-400 font-semibold mt-0.5">{prod.price} ر.س</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setIsManageModalOpen(false);
                            onNavigate('landing-detail', prod.id);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          معاينة
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsManageModalOpen(false);
                            handleOpenEdit(prod);
                          }}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold transition border border-amber-500/20 flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          تعديل
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/20"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-medium transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modals inside LandingPageAdminBar */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-right text-slate-100">
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
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                نعم، احذف المحدد 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDeleteId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-right text-slate-100">
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
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmSingleDelete}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-rose-600/20 cursor-pointer"
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
              setStoreProducts(getSavedProducts());
              setSuccessMsg('تم استيراد المنتج بنجاح ونشره بمتجر Oryx!');
              setTimeout(() => {
                setSuccessMsg('');
                window.location.reload();
              }, 1500);
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
    </>
  );
};
