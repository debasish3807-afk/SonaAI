// @ts-nocheck
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { AuthUser, SendOTPOptions, SignUpResult, GoogleSignInResult } from '../types';
import { Platform } from 'react-native';

/**
 * Maps a Firebase Auth user to the template AuthUser interface.
 */
function mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    username:
      firebaseUser.displayName ??
      firebaseUser.email?.split('@')[0] ??
      `user_${firebaseUser.uid.slice(0, 8)}`,
    created_at: firebaseUser.metadata.creationTime ?? new Date().toISOString(),
    updated_at: firebaseUser.metadata.lastSignInTime ?? new Date().toISOString(),
  };
}

export class FirebaseAuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return mapFirebaseUserToAuthUser(user);
  }

  async sendOTP(email: string, options: SendOTPOptions = {}): Promise<{ error?: string }> {
    // Firebase doesn't have native OTP via email; use password reset link as alternative
    try {
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (error: any) {
      return { error: error.message ?? 'Failed to send verification email' };
    }
  }

  async signUpWithPassword(
    email: string,
    password: string,
    metadata: Record<string, any> = {}
  ): Promise<SignUpResult> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUserToAuthUser(credential.user);

      // Create Firestore profile
      const profileRef = doc(db, 'users', credential.user.uid);
      await setDoc(profileRef, {
        email,
        username: metadata.username ?? email.split('@')[0],
        displayName: metadata.displayName ?? email.split('@')[0],
        plan: 'free',
        onboarded: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { user };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return { error: 'An account with this email already exists.', errorType: 'business' };
      }
      if (error.code === 'auth/weak-password') {
        return { error: 'Password must be at least 6 characters.', errorType: 'business' };
      }
      return { error: error.message ?? 'Registration failed', errorType: 'network' };
    }
  }

  async signInWithPassword(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUserToAuthUser(credential.user);
      return { user };
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        return { error: 'Invalid email or password.', user: null, errorType: 'business' as const };
      }
      if (error.code === 'auth/user-not-found') {
        return { error: 'No account found with this email.', user: null, errorType: 'business' as const };
      }
      return { error: error.message ?? 'Login failed', user: null, errorType: 'network' as const };
    }
  }

  async verifyOTPAndLogin(
    email: string,
    otp: string,
    options?: { password?: string }
  ) {
    // Firebase doesn't support email OTP natively
    // Treat as sign-in with password if password is provided
    if (options?.password) {
      return this.signInWithPassword(email, options.password);
    }
    return { error: 'OTP verification not supported. Use email/password sign-in.', user: null };
  }

  async signInWithGoogle(): Promise<GoogleSignInResult> {
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        await signInWithPopup(auth, provider);
        return { error: null };
      } else {
        // On mobile, Google sign-in is handled by useAuthStore via expo-auth-session
        return { error: 'Use the main auth store for mobile Google sign-in.' };
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return { error: 'Sign-in cancelled.' };
      }
      return { error: error.message ?? 'Google sign-in failed.' };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return {};
    } catch (error: any) {
      return { error: error.message ?? 'Logout failed' };
    }
  }

  async refreshSession() {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true);
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUserToAuthUser(firebaseUser));
      } else {
        callback(null);
      }
    });

    return { unsubscribe };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
