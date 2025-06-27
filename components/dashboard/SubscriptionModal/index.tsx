'use client';

import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { postData, formatPrice } from '@/utils/global';
import Loader from '@/components/Loader';
import { ProductWithPrice, Price } from '@/types/Subscription';
import { toast } from 'sonner';
import { getStripe } from '@/lib/stripe/client';
import { useUser } from '@/lib/context/UserContext';

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

export default function SubscriptionModal ({ products }: SubscriptionModalProps) {
  const { open, setOpen } = useSubscriptionModal();
  const { user } = useUser();
  const subscription = user?.subscriptionPlan;

  const [isLoading, setIsLoading] = useState(false);

  interface CheckoutResponse {
    sessionId: string;
  }

  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast.warning('You must be logged in');
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast.success('Already on a pro plan');
        setIsLoading(false);
        return;
      }

      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      }) as CheckoutResponse;

      console.log('Getting Checkout for stripe');
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch {
      toast.error('Oppse! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {subscription ? (
        <DialogContent className="max-w-md mx-auto">
          <div className="flex flex-col items-center py-8 px-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              You&apos;re all set!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              You&apos;re already on a Pro plan and have access to all premium features.
            </p>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="max-w-2xl mx-auto p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 px-8 pt-8 pb-6">
            <DialogHeader className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-md mx-auto">
                Unlock powerful features and take your productivity to the next level
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 space-y-4">
            {products.length ? (
              products.map((product) => (
                <div key={product.id} className="space-y-4">
                  {product.prices?.map((price) => (
                    <div
                      key={price.id}
                      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/20 dark:hover:shadow-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1"
                    >
                      {price.interval === 'month' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(price)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              / {price.interval}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {price.interval === 'month' ? 'Billed monthly' : 'Billed annually'}
                          </p>

                          <div className="mt-4 space-y-2">
                            {['Unlimited projects', 'Advanced analytics', 'Priority support'].map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="ml-6">
                          <button
                            onClick={() => onClickContinue(price)}
                            disabled={isLoading}
                            className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px]"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <Loader />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span>Upgrade</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No plans available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Please check back later for available subscription plans.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Secure payment powered by Stripe • Cancel anytime
            </p>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};