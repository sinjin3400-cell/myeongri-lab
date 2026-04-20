import { useState, useCallback } from 'react';
import { trackEvent } from '../utils/analytics';

const STORAGE_KEY = 'golden_key_subscription';

export interface SubscriptionState {
  active: boolean;
  subscriptionId?: string;
  subscribedAt?: string;
  expiresAt?: string;
}

function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: false };
    const state: SubscriptionState = JSON.parse(raw);
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return { active: false };
    }
    return state;
  } catch {
    return { active: false };
  }
}

function saveSubscription(state: SubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState(loadSubscription);

  const isSubscribed = subscription.active;

  const activate = useCallback((subscriptionId: string) => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const state: SubscriptionState = {
      active: true,
      subscriptionId,
      subscribedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    saveSubscription(state);
    setSubscription(state);
    trackEvent('subscription_activated', { subscriptionId });
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSubscription({ active: false });
    trackEvent('subscription_deactivated', {});
  }, []);

  const refresh = useCallback(() => {
    setSubscription(loadSubscription());
  }, []);

  return { isSubscribed, subscription, activate, deactivate, refresh };
}
