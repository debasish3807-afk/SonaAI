/**
 * SONA AI — Premium Store (Phase 8)
 * Subscription management with feature gating.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

export type PlanId = 'free' | 'monthly_pro' | 'yearly_pro' | 'lifetime_pro';
export type FeatureId = 'ai_unlimited' | 'voice_unlimited' | 'memory_unlimited'
  | 'export_all' | 'advanced_ai' | 'premium_badge' | 'priority_support';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

export interface PurchaseRecord {
  id: string;
  planId: PlanId;
  purchaseDate: string;
  expiryDate?: string;
  platform: 'android' | 'ios' | 'web';
  status: 'active' | 'expired' | 'cancelled';
}

export interface UsageLimits {
  aiMessagesPerDay: number;
  aiMessagesUsed: number;
  voiceMinutesPerDay: number;
  voiceMinutesUsed: number;
  memoriesMax: number;
  memoriesUsed: number;
  exportsPerMonth: number;
  exportsUsed: number;
}


interface PremiumState {
  currentPlan: PlanId;
  isPro: boolean;
  purchaseHistory: PurchaseRecord[];
  usage: UsageLimits;
  isLoading: boolean;
  error: string | null;

  // Lifecycle
  initialize: () => Promise<void>;

  // Plan management
  purchasePlan: (planId: PlanId) => Promise<{ error: string | null }>;
  restorePurchases: () => Promise<{ error: string | null }>;
  cancelSubscription: () => Promise<{ error: string | null }>;

  // Feature checks
  canUseFeature: (feature: FeatureId) => boolean;
  checkLimit: (feature: 'ai' | 'voice' | 'memory' | 'export') => boolean;
  incrementUsage: (feature: 'ai' | 'voice' | 'memory' | 'export', amount?: number) => void;
  resetDailyUsage: () => void;

  // Plans data
  getPlans: () => Plan[];
  getFeatureList: () => { id: FeatureId; name: string; free: boolean; pro: boolean }[];
}


const PREMIUM_KEY = 'sona_premium_state';

const FREE_LIMITS: UsageLimits = {
  aiMessagesPerDay: 25, aiMessagesUsed: 0,
  voiceMinutesPerDay: 5, voiceMinutesUsed: 0,
  memoriesMax: 50, memoriesUsed: 0,
  exportsPerMonth: 3, exportsUsed: 0,
};

const PRO_LIMITS: UsageLimits = {
  aiMessagesPerDay: 999999, aiMessagesUsed: 0,
  voiceMinutesPerDay: 999999, voiceMinutesUsed: 0,
  memoriesMax: 999999, memoriesUsed: 0,
  exportsPerMonth: 999999, exportsUsed: 0,
};

const PLANS: Plan[] = [
  { id: 'free', name: 'Free', price: '$0', period: '', features: ['25 AI messages/day', '5 min voice/day', '50 memories', '3 exports/month'] },
  { id: 'monthly_pro', name: 'Pro Monthly', price: '$4.99', period: '/month', features: ['Unlimited AI', 'Unlimited voice', 'Unlimited memories', 'All export formats', 'Advanced AI tools', 'Premium badge'], recommended: true },
  { id: 'yearly_pro', name: 'Pro Yearly', price: '$39.99', period: '/year', features: ['Everything in Monthly', 'Save 33%', 'Priority support'] },
  { id: 'lifetime_pro', name: 'Lifetime', price: '$99.99', period: 'one-time', features: ['Everything forever', 'All future features', 'Lifetime badge'] },
];


export const usePremiumStore = create<PremiumState>((set, get) => ({
  currentPlan: 'free',
  isPro: false,
  purchaseHistory: [],
  usage: FREE_LIMITS,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Load from local cache
      const cached = await AsyncStorage.getItem(PREMIUM_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        set({ currentPlan: data.currentPlan ?? 'free', isPro: data.isPro ?? false, usage: data.usage ?? FREE_LIMITS });
      }
      // Sync from Firestore
      const uid = auth.currentUser?.uid;
      if (uid) {
        const snap = await getDoc(doc(db, 'users', uid, 'subscription', 'current'));
        if (snap.exists()) {
          const d = snap.data();
          const plan = d.planId ?? 'free';
          const isPro = plan !== 'free';
          set({ currentPlan: plan, isPro, usage: isPro ? { ...PRO_LIMITS } : { ...FREE_LIMITS } });
        }
      }
    } catch {}
    set({ isLoading: false });
  },

  purchasePlan: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      // In production: integrate with Google Play Billing / App Store
      // For now: mark as purchased in Firestore
      const uid = auth.currentUser?.uid;
      if (!uid) return { error: 'Not authenticated.' };

      const record: PurchaseRecord = {
        id: `purchase_${Date.now()}`, planId,
        purchaseDate: new Date().toISOString(),
        expiryDate: planId === 'lifetime_pro' ? undefined : new Date(Date.now() + (planId === 'yearly_pro' ? 365 : 30) * 86400000).toISOString(),
        platform: 'android', status: 'active',
      };

      await setDoc(doc(db, 'users', uid, 'subscription', 'current'), {
        ...record, updatedAt: serverTimestamp(),
      });

      set(s => ({
        currentPlan: planId, isPro: true,
        usage: PRO_LIMITS,
        purchaseHistory: [record, ...s.purchaseHistory],
        isLoading: false,
      }));

      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify({ currentPlan: planId, isPro: true, usage: PRO_LIMITS }));
      return { error: null };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      return { error: e.message };
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true });
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return { error: 'Not authenticated.' };
      const snap = await getDoc(doc(db, 'users', uid, 'subscription', 'current'));
      if (snap.exists() && snap.data().status === 'active') {
        const plan = snap.data().planId;
        set({ currentPlan: plan, isPro: plan !== 'free', usage: plan !== 'free' ? PRO_LIMITS : FREE_LIMITS, isLoading: false });
        return { error: null };
      }
      set({ isLoading: false });
      return { error: 'No active subscription found.' };
    } catch (e: any) {
      set({ isLoading: false });
      return { error: e.message };
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true });
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return { error: 'Not authenticated.' };
      await setDoc(doc(db, 'users', uid, 'subscription', 'current'), { status: 'cancelled', updatedAt: serverTimestamp() }, { merge: true });
      set({ currentPlan: 'free', isPro: false, usage: FREE_LIMITS, isLoading: false });
      await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify({ currentPlan: 'free', isPro: false, usage: FREE_LIMITS }));
      return { error: null };
    } catch (e: any) {
      set({ isLoading: false });
      return { error: e.message };
    }
  },

  canUseFeature: (feature) => {
    if (get().isPro) return true;
    return false;
  },

  checkLimit: (feature) => {
    const { usage, isPro } = get();
    if (isPro) return true;
    switch (feature) {
      case 'ai': return usage.aiMessagesUsed < usage.aiMessagesPerDay;
      case 'voice': return usage.voiceMinutesUsed < usage.voiceMinutesPerDay;
      case 'memory': return usage.memoriesUsed < usage.memoriesMax;
      case 'export': return usage.exportsUsed < usage.exportsPerMonth;
    }
  },

  incrementUsage: (feature, amount = 1) => {
    set(s => {
      const usage = { ...s.usage };
      switch (feature) {
        case 'ai': usage.aiMessagesUsed += amount; break;
        case 'voice': usage.voiceMinutesUsed += amount; break;
        case 'memory': usage.memoriesUsed += amount; break;
        case 'export': usage.exportsUsed += amount; break;
      }
      return { usage };
    });
  },

  resetDailyUsage: () => {
    set(s => ({ usage: { ...s.usage, aiMessagesUsed: 0, voiceMinutesUsed: 0 } }));
  },

  getPlans: () => PLANS,

  getFeatureList: () => [
    { id: 'ai_unlimited' as FeatureId, name: 'Unlimited AI Messages', free: false, pro: true },
    { id: 'voice_unlimited' as FeatureId, name: 'Unlimited Voice', free: false, pro: true },
    { id: 'memory_unlimited' as FeatureId, name: 'Unlimited Memories', free: false, pro: true },
    { id: 'export_all' as FeatureId, name: 'All Export Formats', free: false, pro: true },
    { id: 'advanced_ai' as FeatureId, name: 'Advanced AI Tools', free: false, pro: true },
    { id: 'premium_badge' as FeatureId, name: 'Premium Badge', free: false, pro: true },
    { id: 'priority_support' as FeatureId, name: 'Priority Support', free: false, pro: true },
  ],
}));
