// @ts-nocheck
import { useState, useEffect } from 'react';
import { AuthContextType, SendOTPResult, AuthResult, LogoutResult, SignUpResult, GoogleSignInResult } from '../types';
import { firebaseAuthService } from './service';
import { useFirebaseAuthContext } from './context';

export function useFirebaseAuth(): AuthContextType {
  const context = useFirebaseAuthContext();

  const sendOTP = async (email: string): Promise<SendOTPResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.sendOTP(email);
      return result;
    } catch (error) {
      return { error: 'Failed to send verification code' };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const verifyOTPAndLogin = async (
    email: string,
    otp: string,
    options?: { password?: string }
  ): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.verifyOTPAndLogin(email, otp, options);
      return result;
    } catch (error) {
      return { error: 'Login failed', user: null };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<SignUpResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.signUpWithPassword(email, password, metadata || {});
      return result;
    } catch (error) {
      return { error: 'Registration failed', user: null };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<AuthResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.signInWithPassword(email, password);
      return result;
    } catch (error) {
      return { error: 'Login failed', user: null };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.signInWithGoogle();
      return result;
    } catch (error) {
      return { error: 'Google sign-in failed' };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const logout = async (): Promise<LogoutResult> => {
    context.setOperationLoading(true);
    try {
      const result = await firebaseAuthService.logout();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return { error: errorMessage };
    } finally {
      context.setOperationLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      await firebaseAuthService.refreshSession();
    } catch (error) {
      console.warn('[Template:useFirebaseAuth] Refresh session error:', error);
    }
  };

  return {
    user: context.user,
    loading: context.loading,
    operationLoading: context.operationLoading,
    initialized: context.initialized,
    setOperationLoading: context.setOperationLoading,
    sendOTP,
    verifyOTPAndLogin,
    signUpWithPassword,
    signInWithPassword,
    signInWithGoogle,
    logout,
    refreshSession,
  };
}

export function useFirebaseAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const refreshDebugInfo = async () => {
    const user = await firebaseAuthService.getCurrentUser();
    setDebugInfo({ currentUser: user });
  };

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  return {
    debugInfo,
    refreshDebugInfo,
  };
}
