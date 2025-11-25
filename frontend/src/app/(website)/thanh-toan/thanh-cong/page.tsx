'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { Skeleton } from '@/components/ui/skeleton';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderNumber = searchParams.get('orderNumber');
  const totalAmount = searchParams.get('totalAmount');
  const paymentMethod = searchParams.get('paymentMethod');

  useEffect(() => {
    // Redirect if no order number
    if (!orderNumber) {
      router.push('/');
      return;
    }
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH_ON_DELIVERY: 'Thanh toán khi nhận hàng',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    CREDIT_CARD: 'Thẻ tín dụng/ghi nợ',
    MOMO: 'Ví MoMo',
    ZALOPAY: 'Ví ZaloPay',
    VNPAY: 'Ví VNPay',
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Success Icon & Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi
        </p>
      </div>

      {/* Order Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          {/* Order Number */}
          <div className="text-center pb-4 border-b">
            <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">
              {orderNumber}
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {totalAmount && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng tiền</span>
                <PriceDisplay
                  price={parseFloat(totalAmount)}
                  size="lg"
                  className="font-bold"
                />
              </div>
            )}

            {paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phương thức thanh toán</span>
                <span className="text-sm font-medium text-gray-900">
                  {paymentMethodLabels[paymentMethod] || paymentMethod}
                </span>
              </div>
            )}

            <Separator />

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Bước tiếp theo:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p>
                    Chúng tôi sẽ gửi email xác nhận đơn hàng trong vài phút tới
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p>
                    Đơn hàng sẽ được xử lý và đóng gói trong vòng 24 giờ
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p>
                    Bạn sẽ nhận được thông báo khi đơn hàng được giao cho đơn vị vận chuyển
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button asChild variant="default" size="lg" className="sm:col-span-3">
          <Link href={`/don-hang/${orderNumber}`}>
            <Package className="h-5 w-5 mr-2" />
            Xem chi tiết đơn hàng
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link href="/don-hang">
            <Package className="h-5 w-5 mr-2" />
            Đơn hàng của tôi
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg">
          <Link href={`/theo-doi-don-hang?order=${orderNumber}`}>
            <Truck className="h-5 w-5 mr-2" />
            Theo dõi vận chuyển
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="h-5 w-5 mr-2" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      {/* Additional Info */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Mẹo hữu ích
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Lưu mã đơn hàng để dễ dàng tra cứu và theo dõi
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Kiểm tra email thường xuyên để nhận thông báo cập nhật
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>
                Liên hệ hotline nếu cần hỗ trợ về đơn hàng
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-2xl mx-auto px-4 py-12 text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
