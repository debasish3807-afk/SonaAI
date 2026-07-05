// services/config.ts

export type AuthProvider = 'firebase' | 'supabase';

export function getAuthProvider(): AuthProvider {
  const raw = (process.env.AUTH_PROVIDER || 'supabase').toLowerCase();
  return raw === 'firebase' ? 'firebase' : 'supabase';
}

export function isFirebaseProvider(): boolean {
  return getAuthProvider() === 'firebase';
}
