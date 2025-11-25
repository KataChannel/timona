'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, ArrowLeft, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Step = 'phone' | 'verify' | 'success';

export default function PhonePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Mã OTP đã được gửi đến số điện thoại của bạn');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Xác thực thành công!');
      setStep('success');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 py-6 px-4 sm:py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Xác thực số điện thoại</CardTitle>
                <CardDescription className="text-sm">
                  {step === 'phone' && 'Nhập số điện thoại để nhận mã OTP'}
                  {step === 'verify' && 'Nhập mã OTP đã được gửi'}
                  {step === 'success' && 'Xác thực hoàn tất'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0987654321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhập số điện thoại 10-11 chữ số
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi OTP...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Gửi mã OTP
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  Mã OTP đã được gửi đến <strong>{phoneNumber}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP (6 chữ số)</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-semibold"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  disabled={loading}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác nhận'
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  toast.info('Đang gửi lại mã OTP...');
                  handleSendOTP(new Event('submit') as any);
                }}
                disabled={loading}
              >
                Gửi lại mã OTP
              </Button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-green-600">
                  Xác thực thành công!
                </h3>
                <p className="text-muted-foreground">
                  Số điện thoại của bạn đã được xác thực.
                </p>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển hướng...
                </p>
              </div>

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Tiếp tục
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Bạn đã có tài khoản?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}