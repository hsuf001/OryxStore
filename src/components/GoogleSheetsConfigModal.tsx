import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { getSheetsWebhookUrl, saveSheetsWebhookUrl } from '../utils/orderStorage';

interface GoogleSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsConfigModal: React.FC<GoogleSheetsConfigModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(getSheetsWebhookUrl());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSheetsWebhookUrl(webhookUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ربط المتجر بـ Google Sheets</h3>
              <p className="text-xs text-emerald-100">استقبال الطلبات والزبناء مباشرة في شيت الخاص بك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl text-center">
              ✅ تم حفظ رابط Webhook بنجاح!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رابط Google Apps Script Webhook URL *
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-left"
              dir="ltr"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              قم بلصق رابط Webhook الخاص بسكريبت Google Sheets لاستقبال تفاصيل كل طلب فور إتمامه.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" /> كيف تحصل على الرابط؟
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-500">
              <li>أنشئ Google Sheet جديدة في حسابك.</li>
              <li>اضغط على Extensions &gt; Apps Script.</li>
              <li>قم بلصق كود السكريبت الخاص باستقبال الطلبات (DoPost).</li>
              <li>انشر السكريبت كـ Web App وانسخ رابط الويب هوك (URL).</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الربط</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
