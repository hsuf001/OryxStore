import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = encodeURIComponent(`رسالة جديدة من متجر أوريكس - ${formData.name}`);
    const body = encodeURIComponent(`الاسم الكامل: ${formData.name}\nرقم الهاتف: ${formData.phone}\n\nالرسالة:\n${formData.message}`);
    window.location.href = `mailto:support@oryxstore.sa?subject=${subject}&body=${body}`;

    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fadeIn">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold border border-indigo-200">
          <PhoneCall className="w-4 h-4 text-indigo-600" /> تواصل معنا
        </div>
        <h1 className="text-4xl font-black text-slate-900">نحن هنا للإجابة على استفساراتكم</h1>
        <p className="text-slate-600 text-base">
          فريق خدمة عملاء أوريكس رهن إشارتكم طوال أيام الأسبوع لتقديم المساعدة وتتبع طلبياتكم في جميع مناطق المملكة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <a
            href="https://wa.me/966501234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-emerald-500 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">الواتساب والهاتف</h3>
              <p className="text-sm text-slate-600 font-mono" dir="ltr">+966 50 123 4567</p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">انقر للتواصل المباشر عبر واتساب</span>
            </div>
          </a>

          <a
            href="mailto:support@oryxstore.sa"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-500 transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">البريد الإلكتروني</h3>
              <p className="text-sm text-slate-600 font-mono">support@oryxstore.sa</p>
              <span className="text-xs text-slate-400 mt-1 inline-block">نرد خلال أقل من ساعتين</span>
            </div>
          </a>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">العنوان الرئيسي</h3>
              <p className="text-sm text-slate-600">شارع الملك فهد، الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          {sent ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-sm text-slate-600">
                تم توجيه رسالتك إلى البريد الإلكتروني <span className="font-bold text-indigo-600">support@oryxstore.sa</span> وسنرد عليك في أقرب وقت.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl"
              >
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 mb-2">أرسل لنا رسالة مباشرة</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سلطان القحطاني"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXX أو 011XXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رسالتك أو استفسارك *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب استفسارك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة إلى الدعم الفني</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
