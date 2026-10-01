import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, Trash2, ShieldAlert, Layers, Check } from 'lucide-react';
import { Order, ViewMode } from '../types';
import { getSavedOrders, updateOrderStatus, deleteOrder } from '../utils/orderStorage';

interface OrdersAdminViewProps {
  onNavigate?: (view: ViewMode) => void;
}

export const OrdersAdminView: React.FC<OrdersAdminViewProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const refreshOrders = () => setOrders(getSavedOrders());
    refreshOrders();
    window.addEventListener('storage', refreshOrders);
    return () => window.removeEventListener('storage', refreshOrders);
  }, []);

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    const updated = updateOrderStatus(orderId, status);
    setOrders(updated);
  };

  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      const updated = deleteOrder(orderToDelete);
      setOrders(updated);
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.phone.includes(searchTerm) ||
                          o.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة الطلبات والزبناء (Leads)</h1>
          <p className="text-sm text-slate-500 mt-1">تتبع الطلبات الواردة من صفحات الهبوط والمتجر وحالة التوصيل</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl text-xs font-bold border border-indigo-200">
            إجمالي الطلبات: {orders.length}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم الهاتف، أو رقم الطلب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-600 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'جديد', 'مؤكد', 'قيد الشحن', 'تم التوصيل', 'ملغي'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === st
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'all' ? 'جميع الطلبات' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-700 text-base">لا توجد طلبات مطابقة</h3>
            <p className="text-xs text-slate-500">ستظهر الطلبات هنا فور قيام أي زبون بطلب منتج من المتجر أو صفحات الهبوط.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-4 px-6">رقم الطلب</th>
                  <th className="py-4 px-6">المنتج</th>
                  <th className="py-4 px-6">الزبون ورقم الهاتف</th>
                  <th className="py-4 px-6">المدينة والعنوان</th>
                  <th className="py-4 px-6">المبلغ</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-indigo-600">{ord.id}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 block">{ord.productTitle}</span>
                      <span className="text-xs text-slate-400">الكمية: {ord.quantity}</span>
                      <details className="mt-1 text-xs text-slate-500">
                        <summary className="cursor-pointer text-indigo-600 font-semibold">تفاصيل المنتج</summary>
                        {ord.productSnapshot ? (
                          <div className="mt-2 space-y-1 max-w-xs">
                            <div>كود المنتج: <span className="font-mono text-slate-700" dir="ltr">{ord.productSnapshot.productSku || 'غير مسجل'}</span></div>
                            <div>معرّف المنتج: <span className="font-mono text-slate-700" dir="ltr">{ord.productSnapshot.sourceProductId || ord.productId}</span></div>
                            {ord.productSnapshot.description && <p className="text-slate-600">{ord.productSnapshot.description}</p>}
                            {ord.productSnapshot.features?.map((feature, index) => <div key={index} className="text-slate-600">• {feature}</div>)}
                            {ord.productSnapshot.specs && Object.entries(ord.productSnapshot.specs).map(([key, value]) => (
                              <div key={key}>{key}: <span className="text-slate-700">{value}</span></div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-amber-700">هذا طلب قديم ولا يحتوي على نسخة محفوظة من بيانات المنتج.</p>
                        )}
                      </details>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800 block">{ord.fullName}</span>
                      <span className="text-xs text-indigo-600 font-mono" dir="ltr">{ord.phone}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block">{ord.city}</span>
                      <span className="text-xs text-slate-500 truncate max-w-xs block">{ord.address}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900">
                      {ord.price * ord.quantity} <span className="text-xs font-normal">ر.س</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'جديد' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        ord.status === 'مؤكد' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        ord.status === 'قيد الشحن' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        ord.status === 'تم التوصيل' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {ord.status === 'جديد' && <Clock className="w-3.5 h-3.5" />}
                        {ord.status === 'مؤكد' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ord.status === 'قيد الشحن' && <Truck className="w-3.5 h-3.5" />}
                        {ord.status === 'تم التوصيل' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ord.status === 'ملغي' && <XCircle className="w-3.5 h-3.5" />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as Order['status'])}
                          className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                        >
                          <option value="جديد">جديد</option>
                          <option value="مؤكد">مؤكد</option>
                          <option value="قيد الشحن">قيد الشحن</option>
                          <option value="تم التوصيل">تم التوصيل</option>
                          <option value="ملغي">ملغي</option>
                        </select>

                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-200 shrink-0"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-fadeIn border border-slate-100 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">تأكيد الحذف</h3>
              <p className="text-xs text-slate-500">هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition shadow-md shadow-rose-600/30"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
