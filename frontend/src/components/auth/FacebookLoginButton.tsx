'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LOGIN_WITH_FACEBOOK } from '@/lib/graphql/mutations/auth';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [fbLoaded, setFbLoaded] = useState(false);
  const router = useRouter();

  const [loginWithFacebook] = useMutation(LOGIN_WITH_FACEBOOK, {
    onCompleted: (data) => {
      const { token, user, redirectUrl } = data.loginWithFacebook;
      
      // Store the token
      localStorage.setItem('authToken', token);
      
      toast.success(`Welcome ${user.name || user.email}!`);
      
      if (onSuccess) {
        onSuccess(data.loginWithFacebook);
      }
      
      // Use redirectUrl from backend settings or fallback to /dashboard
      const targetUrl = redirectUrl || '/dashboard';
      router.push(targetUrl);
    },
    onError: (error) => {
      console.error('Facebook login error:', error);
      toast.error(error.message || 'Facebook login failed');
      
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  });

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      if (window.FB) {
        setFbLoaded(true);
        return;
      }

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        setFbLoaded(true);
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js: any, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  const handleFacebookLogin = () => {
    if (!fbLoaded || !window.FB) {
      toast.error('Facebook SDK not loaded');
      return;
    }

    setLoading(true);

    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          
          // Call the GraphQL mutation with the access token
          loginWithFacebook({
            variables: {
              input: {
                token: accessToken,
                provider: 'FACEBOOK'
              }
            }
          });
        } else {
          setLoading(false);
          toast.error('Facebook login was cancelled');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <div className="w-full">
      <button
        onClick={handleFacebookLogin}
        disabled={loading || !fbLoaded}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            Signing you in...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </>
        )}
      </button>
      {!fbLoaded && (
        <div className="flex items-center justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading Facebook...</span>
        </div>
      )}
    </div>
  );
};

export default FacebookLoginButton;
