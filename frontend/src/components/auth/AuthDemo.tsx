'use client';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './GoogleLoginButton';
import FacebookLoginButton from './FacebookLoginButton';
import { toast } from 'sonner';

const AuthDemo: React.FC = () => {
  const {
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    handlePhoneLogin,
    handleRequestOtp,
    handleRegister,
    logout,
    loginLoading,
    googleLoading,
    facebookLoading,
    phoneLoading,
    otpLoading,
    registerLoading,
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [message, setMessage] = useState('');

  // Request OTP for phone login
  const requestOtp = async () => {
    if (!phone) {
      setMessage('Vui lòng nhập số điện thoại');
      return;
    }

    const result = await handleRequestOtp({ phone });
    
    if (result.success) {
      setOtpRequested(true);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  // Login with phone and OTP
  const loginWithPhone = async () => {
    if (!phone || !otp) {
      setMessage('Vui lòng nhập số điện thoại và mã OTP');
      return;
    }

    const result = await handlePhoneLogin({ phone, otp });
    
    if (result.success) {
      setMessage('Đăng nhập thành công!');
      console.log('User:', result.user);
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Demo Authentication</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          {message}
        </div>
      )}

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Status</h3>
        <p className="text-sm text-gray-600">
          User authenticated: <span className="font-medium">Not checked</span>
        </p>
        <p className="text-sm text-gray-600">
          Authentication tokens are handled automatically by OAuth components
        </p>
      </div>

      {/* Phone Login Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Đăng nhập bằng số điện thoại</h3>
        
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        
        {!otpRequested ? (
          <button
            onClick={requestOtp}
            disabled={otpLoading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {otpLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={loginWithPhone}
              disabled={phoneLoading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {phoneLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </>
        )}
      </div>

      {/* Social Login Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Đăng nhập mạng xã hội</h3>
        
        <div className="space-y-3">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <GoogleLoginButton />
          </GoogleOAuthProvider>
          
          <FacebookLoginButton />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mb-6"
      >
        Đăng xuất
      </button>

      {/* Demo Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Demo Instructions</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Google/Facebook OAuth buttons connect to real authentication APIs</li>
          <li>• Phone OTP is simulated for demo purposes</li>
          <li>• Successful logins redirect to dashboard automatically</li>
          <li>• JWT tokens are stored in localStorage</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDemo;
