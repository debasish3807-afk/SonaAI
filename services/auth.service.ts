/**
 * SONA AI — Authentication Service
 * Backend: OnSpace Cloud (Supabase-compatible)
 *
 * Supports:
 *  - Email / Password sign-in & sign-up
 *  - Google OAuth  (requires Google provider enabled in OnSpace Cloud Dashboard → User → Auth Settings)
 *  - Guest / anonymous mode  (local only, no backend session)
 *  - Forgot password via email reset link
 *  - Session persistence via Supabase session storage
 *  - Protected route helpers
 *
 * To enable Google Sign-In:
 *  1. Go to OnSpace Cloud Dashboard → User → Auth Settings
 *  2. Enable Google provider and add Client ID + Client Secret
 *  3. Add redirect URI:  sonaai://auth/callback
 */

export { useAuthStore } from '@/stores/useAuthStore';
export type { SonaUser } from '@/stores/useAuthStore';
