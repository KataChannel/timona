'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// GraphQL Mutations
const REQUEST_FORGOT_PASSWORD = gql`
  mutation RequestForgotPassword($email: String!) {
    requestForgotPassword(email: $email) {
      success
      message
      token
    }
  }
`;

const VERIFY_RESET_TOKEN = gql`
  mutation VerifyResetToken($email: String!, $token: String!) {
    verifyResetToken(email: $email, token: $token) {
      success
      message
    }
  }
`;

const RESET_PASSWORD_WITH_TOKEN = gql`
  mutation ResetPasswordWithToken($email: String!, $token: String!, $newPassword: String!) {
    resetPasswordWithToken(email: $email, token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

type Step = 'email' | 'verify' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devToken, setDevToken] = useState(''); // For development

  const [requestReset, { loading: requestLoading }] = useMutation(REQUEST_FORGOT_PASSWORD);
  const [verifyToken, { loading: verifyLoading }] = useMutation(VERIFY_RESET_TOKEN);
  const [resetPassword, { loading: resetLoading }] = useMutation(RESET_PASSWORD_WITH_TOKEN);

  // Step 1: Request reset email
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
        
        // Store dev token if available
        if (data.requestForgotPassword.token) {
          setDevToken(data.requestForgotPassword.token);
          toast.info(`Mã OTP (Dev): ${data.requestForgotPassword.token}`, {
            duration: 10000,
          });
        }
        
        setStep('verify');
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  // Step 2: Verify token
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

  // Step 3: Reset password
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
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 py-6 px-4 sm:py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Quên mật khẩu</CardTitle>
                <CardDescription className="text-sm">
                  {step === 'email' && 'Nhập email để nhận mã xác thực'}
                  {step === 'verify' && 'Nhập mã OTP đã được gửi đến email'}
                  {step === 'password' && 'Tạo mật khẩu mới'}
                  {step === 'success' && 'Hoàn tất đặt lại mật khẩu'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={requestLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Chúng tôi sẽ gửi mã xác thực đến email của bạn
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={requestLoading}
              >
                {requestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi mã xác thực'
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Mã OTP đã được gửi đến <strong>{email}</strong>
                  {devToken && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm">
                      <strong>Dev:</strong> {devToken}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="token">Mã OTP (6 chữ số)</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-semibold"
                  maxLength={6}
                  required
                  disabled={verifyLoading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('email')}
                  disabled={verifyLoading}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={verifyLoading || token.length !== 6}
                >
                  {verifyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác nhận'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={resetLoading}
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Tối thiểu 6 ký tự
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={resetLoading}
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đặt lại...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-950/20 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-500">
                  Thành công!
                </h3>
                <p className="text-muted-foreground">
                  Mật khẩu của bạn đã được đặt lại thành công.
                </p>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              </div>

              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Đăng nhập ngay
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Đã nhớ mật khẩu?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
