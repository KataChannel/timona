'use client';

import { useMutation } from '@apollo/client';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { LOGIN_WITH_GOOGLE } from '../../lib/graphql/auth-queries';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface GoogleJwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name: string;
  family_name: string;
  picture: string;
  name: string;
}

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [loginWithGoogle] = useMutation(LOGIN_WITH_GOOGLE);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google');
      toast.error('Google login failed. Please try again.');
      return;
    }

    try {
      setLoading(true);

      // Decode JWT token to get user info
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      console.log('Decoded Google token:', decoded);

      // Send to backend for processing
      const { data } = await loginWithGoogle({
        variables: {
          input: {
            token: credentialResponse.credential,
            provider: 'GOOGLE',
            email: decoded.email,
            providerId: decoded.sub,
            firstName: decoded.given_name,
            lastName: decoded.family_name,
            avatar: decoded.picture,
          }
        }
      });
      
      console.log('Login response:', data);
      
      if (data?.loginWithGoogle) {
        const { accessToken, refreshToken, user, redirectUrl } = data.loginWithGoogle;
        
        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        // Show success message
        const isNewUser = user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 5000);
        if (isNewUser) {
          toast.success(`Welcome to rausachcore, ${user.firstName || user.username}! Your account has been created.`);
        } else {
          toast.success(`Welcome back, ${user.firstName || user.username}!`);
        }
        
        // Small delay to ensure toast is shown, then redirect
        setTimeout(() => {
          // Use redirectUrl from backend settings or fallback to /dashboard
          const targetUrl = redirectUrl || '/dashboard';
          window.location.href = targetUrl;
        }, 500);
      } else {
        toast.error('Google login failed. Please try again.');
      }

    } catch (error: any) {
      console.error('Error processing Google login:', error);
      
      // Handle specific error messages
      if (error.message.includes('User not found')) {
        toast.error('Account not found. Please register first.');
      } else if (error.message.includes('Account is disabled')) {
        toast.error('Your account has been disabled. Please contact support.');
      } else {
        toast.error('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        logo_alignment="center"
      />
      {loading && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Signing you in...</span>
        </div>
      )}
    </div>
  );
}
