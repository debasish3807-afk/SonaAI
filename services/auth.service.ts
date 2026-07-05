/**
 * SONA AI — Authentication Service
 * Backend: Firebase Authentication
 *
 * Supports:
 *  - Email / Password sign-in & sign-up
 *  - Google OAuth (web popup + mobile expo-auth-session)
 *  - Anonymous / Guest mode (Firebase anonymous auth)
 *  - Forgot password via email reset link
 *  - Session persistence via Firebase Auth SDK
 *  - User profiles stored in Cloud Firestore
 */

export { useAuthStore } from '@/stores/useAuthStore';
export type { SonaUser } from '@/stores/useAuthStore';
