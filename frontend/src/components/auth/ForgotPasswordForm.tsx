'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  REQUEST_FORGOT_PASSWORD,
  VERIFY_RESET_TOKEN,
  RESET_PASSWORD_WITH_TOKEN,
  type RequestForgotPasswordResponse,
  type VerifyResetTokenResponse,
  type ResetPasswordWithTokenResponse,
} from '@/graphql/auth/forgot-password.graphql';

type Step = 'email' | 'verify' | 'password' | 'success';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devToken, setDevToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [requestReset, { loading: requestLoading }] = useMutation<RequestForgotPasswordResponse>(
    REQUEST_FORGOT_PASSWORD
  );
  const [verifyToken, { loading: verifyLoading }] = useMutation<VerifyResetTokenResponse>(
    VERIFY_RESET_TOKEN
  );
  const [resetPassword, { loading: resetLoading }] = useMutation<ResetPasswordWithTokenResponse>(
    RESET_PASSWORD_WITH_TOKEN
  );

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    try {
      const { data } = await requestReset({
        variables: { email },
      });

      if (data?.requestForgotPassword?.success) {
        toast.success(data.requestForgotPassword.message);

        if (data.requestForgotPassword.token) {
          setDevToken(data.requestForgotPassword.token);
          toast.info(`Mã OTP: ${data.requestForgotPassword.token}`, {
            duration: 15000,
          });
        }

        setStep('verify');
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || token.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    try {
      const { data } = await verifyToken({
        variables: { email, token },
      });

      if (data?.verifyResetToken?.success) {
        toast.success('Mã xác thực hợp lệ');
        setStep('password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Mã xác thực không hợp lệ');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: { email, token, newPassword },
      });

      if (data?.resetPasswordWithToken?.success) {
        toast.success('Đặt lại mật khẩu thành công');
        setStep('success');

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/login"
              className="text-white/80 hover:text-white transition-colors touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Quên mật khẩu
            </h1>
          </div>
          <p className="text-sm sm:text-base text-white/90">
            {step === 'email' && 'Nhập email để nhận mã xác thực'}
            {step === 'verify' && 'Nhập mã OTP đã gửi đến email'}
            {step === 'password' && 'Tạo mật khẩu mới cho tài khoản'}
            {step === 'success' && 'Hoàn tất đặt lại mật khẩu'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email của bạn
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 sm:h-12 text-base"
                    required
                    disabled={requestLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-base font-medium touch-manipulation"
                disabled={requestLoading || !email}
                size="lg"
              >
                {requestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Gửi mã xác thực
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-sm">
                  Mã OTP đã được gửi đến <strong className="text-blue-700">{email}</strong>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Mã có hiệu lực trong 15 phút
                  </span>
                  {devToken && (
                    <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                      <p className="text-xs font-medium text-yellow-800 mb-1">
                        🔧 Development Mode
                      </p>
                      <p className="text-sm font-mono font-bold text-yellow-900">
                        OTP: {devToken}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm sm:text-base">
                  Mã OTP (6 chữ số)
                </Label>
                <Input
                  id="token"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="text-center text-2xl sm:text-3xl tracking-[0.5em] sm:tracking-[0.75em] font-mono h-14 sm:h-16"
                  maxLength={6}
                  required
                  disabled={verifyLoading}
                  autoComplete="one-time-code"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 sm:h-12 text-base touch-manipulation"
                  onClick={() => {
                    setStep('email');
                    setToken('');
                  }}
                  disabled={verifyLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 sm:h-12 text-base font-medium touch-manipulation"
                  disabled={verifyLoading || token.length !== 6}
                  size="lg"
                >
                  {verifyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác nhận OTP'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm sm:text-base">
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-12 h-11 sm:h-12 text-base"
                    required
                    disabled={resetLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tối thiểu 6 ký tự, nên bao gồm chữ hoa, chữ thường và số
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-12 h-11 sm:h-12 text-base"
                    required
                    disabled={resetLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-base font-medium touch-manipulation"
                disabled={resetLoading || !newPassword || !confirmPassword}
                size="lg"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đặt lại...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Đặt lại mật khẩu
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 sm:space-y-6 py-6 sm:py-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4 sm:p-6">
                  <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-green-600">
                  Thành công!
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Mật khẩu của bạn đã được đặt lại thành công.
                  <br />
                  Bạn có thể đăng nhập với mật khẩu mới.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">
                  Đang chuyển hướng...
                </p>
              </div>

              <Button
                onClick={() => router.push('/login')}
                className="w-full h-11 sm:h-12 text-base font-medium touch-manipulation"
                size="lg"
              >
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Đã nhớ mật khẩu?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
