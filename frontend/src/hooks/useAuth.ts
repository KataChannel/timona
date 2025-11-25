import { useMutation } from '@apollo/client';
import { 
  LOGIN_USER, 
  LOGIN_WITH_GOOGLE, 
  LOGIN_WITH_FACEBOOK, 
  LOGIN_WITH_PHONE,
  REQUEST_PHONE_VERIFICATION,
  REGISTER_USER 
} from '../lib/graphql/auth-queries';

export interface LoginUserInput {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface SocialLoginInput {
  token: string;
  provider: 'GOOGLE' | 'FACEBOOK';
  email?: string;
  providerId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  rememberMe?: boolean;
}

export interface PhoneLoginInput {
  phone: string;
  otp: string;
  rememberMe?: boolean;
}

export interface RequestPhoneVerificationInput {
  phone: string;
}

export interface RegisterUserInput {
  email?: string;
  username: string;
  password?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export const useAuth = () => {
  // Login mutations
  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);
  const [loginWithGoogle, { loading: googleLoading }] = useMutation(LOGIN_WITH_GOOGLE);
  const [loginWithFacebook, { loading: facebookLoading }] = useMutation(LOGIN_WITH_FACEBOOK);
  const [loginWithPhone, { loading: phoneLoading }] = useMutation(LOGIN_WITH_PHONE);
  const [requestPhoneVerification, { loading: otpLoading }] = useMutation(REQUEST_PHONE_VERIFICATION);
  const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_USER);

  // Login methods
  const handleLogin = async (input: LoginUserInput) => {
    try {
      const result = await loginUser({
        variables: { input },
      });
      
      const { accessToken, refreshToken, user, redirectUrl } = result.data.loginUser;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken, redirectUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleGoogleLogin = async (input: SocialLoginInput) => {
    try {
      const result = await loginWithGoogle({
        variables: { input },
      });
      
      const { accessToken, refreshToken, user, redirectUrl } = result.data.loginWithGoogle;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken, redirectUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleFacebookLogin = async (input: SocialLoginInput) => {
    try {
      const result = await loginWithFacebook({
        variables: { input },
      });
      
      const { accessToken, refreshToken, user, redirectUrl } = result.data.loginWithFacebook;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken, redirectUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handlePhoneLogin = async (input: PhoneLoginInput) => {
    try {
      const result = await loginWithPhone({
        variables: { input },
      });
      
      const { accessToken, refreshToken, user, redirectUrl } = result.data.loginWithPhone;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken, redirectUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleRequestOtp = async (input: RequestPhoneVerificationInput) => {
    try {
      const result = await requestPhoneVerification({
        variables: { input },
      });
      
      return result.data.requestPhoneVerification;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const handleRegister = async (input: RegisterUserInput) => {
    try {
      const result = await registerUser({
        variables: { input },
      });
      
      const { accessToken, refreshToken, user, redirectUrl } = result.data.registerUser;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user, accessToken, refreshToken, redirectUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return {
    // Methods
    handleLogin,
    handleGoogleLogin,
    handleFacebookLogin,
    handlePhoneLogin,
    handleRequestOtp,
    handleRegister,
    logout,
    
    // Loading states
    loginLoading,
    googleLoading,
    facebookLoading,
    phoneLoading,
    otpLoading,
    registerLoading,
  };
};
