export interface Price {
  id: string;
  productId: string;
  description?: string;
  active: boolean;
  unitAmount: number;
  currency?: string;
  type: 'one_time' | 'recurring';
  interval: 'week' | 'day' | 'month' | 'year';
  intervalCount?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, any>;
}

export type ProductWithPrice = Product & {
  prices?: Price[];
}

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused' | 'ended';

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  metadata?: Record<string, any>;
  priceId: string;
  cancelAtPeriodEnd?: boolean;
  created: Date;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date;
  endedAt?: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
}

export interface Customer {
  id: string;
  stripeCustomerId: string;
}

export interface Product {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}