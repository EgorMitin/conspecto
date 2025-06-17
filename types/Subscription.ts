export interface Price {
  id: string;
  unitAmount: number;
  currency?: string;
  interval?: 'month' | 'year';
}

export interface ProductWithPrice {
  id: string;
  name: string;
  description?: string;
  prices?: Price[];
}

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused' | 'ended';

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  metadata?: Record<string, any>;
  priceId: number;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
  created: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  endedAt?: string;
  cancelAt?: string;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
}

export interface Customer {
  id: string;
  stripeCustomerId: string;
}