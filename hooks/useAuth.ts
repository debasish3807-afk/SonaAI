/**
 * useAuth — SONA AI Auth Hook
 * Thin wrapper around useAuthStore for component consumption
 */
import { useAuthStore } from '@/stores/useAuthStore';

export function useAuth() {
  return useAuthStore();
}
