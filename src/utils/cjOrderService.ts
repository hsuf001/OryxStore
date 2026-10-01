import { getCjHeaders } from './cjConfig';

export interface CjOrderPayload {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  cityName: string;
  provinceName?: string;
  sku: string;
  vid?: string;
  quantity: number;
}

export interface CjOrderResponse {
  success: boolean;
  cjOrderId?: string;
  error?: string;
}

export async function createCjDirectOrder(orderData: CjOrderPayload): Promise<CjOrderResponse> {
  const payload = {
    orderNumber: orderData.orderId,
    shippingCustomerName: orderData.customerName,
    shippingPhone: orderData.phone,
    shippingAddress: orderData.address,
    shippingCity: orderData.cityName,
    shippingProvince: orderData.provinceName || orderData.cityName,
    shippingCountryCode: 'SA', // السعودية
    shippingZip: '11564', // الرمز البريدي
    shippingCustomerMethod: 'CJPacket', // شركة الشحن الموصى بها للخليج
    products: [
      {
        vid: orderData.vid || '',
        sku: orderData.sku,
        quantity: orderData.quantity || 1,
      },
    ],
  };

  try {
    const response = await fetch('/api/cj/order', {
      method: 'POST',
      headers: getCjHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.result && result.code === 200) {
      console.log('✅ تم إنشاء الطلب بنجاح فـ CJ:', result.data);
      return { success: true, cjOrderId: result.data };
    } else {
      console.warn('⚠️ خطأ في إنشاء طلب CJ:', result.message);
      return { success: false, error: result.message };
    }
  } catch (err: any) {
    console.error('❌ تعذر الاتصال بـ CJ API:', err);
    return { success: false, error: err.message };
  }
}
