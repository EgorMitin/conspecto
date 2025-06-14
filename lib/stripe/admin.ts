import Stripe from 'stripe';
import { Subscription } from '@/types/Subscription';
import { stripe } from './index';
import { toDateTime } from '@/utils/global';
import DatabaseService from '@/services/DatabaseService';
import { logger } from '@/utils/logger';


export async function createOrRetrieveCustomer ({ email, uuid }: {
  email: string;
  uuid: string;
}) {
  try {
    const response = await DatabaseService.getCustomerById(uuid);
    if (!response) throw new Error();
    return response.stripeCustomerId;
  } catch (error) {
    const customerData: { metadata: { supabaseUUID: string }; email?: string } =
      {
        metadata: {
          supabaseUUID: uuid,
        },
      };
    if (email) customerData.email = email;
    try {
      const customer = await stripe.customers.create(customerData);
      await DatabaseService.createCustomer({ id: uuid, stripeCustomerId: customer.id });
      logger.debug(`New customer created and inserted for ${uuid}.`);
      return customer.id;
    } catch (stripeError) {
      logger.error(`Error creating customer for ${uuid}: ${stripeError}`);
      throw new Error('Could not create Customer or find the customer');
    }
  }
};

export async function copyBillingDetailsToCustomer (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  try {
    await DatabaseService.updateUserPaymentData(uuid, { ...payment_method[payment_method.type] }, { ...address })
  } catch (error) {
    throw new Error('Couldnot copy customer billing details');
  }
};

export async function manageSubscriptionStatusChange (
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  try {
    const customerData = await DatabaseService.getCustomerByStripeId(customerId);
    if (!customerData) throw new Error('🔴Cannot find the customer');
    const { id: uuid } = customerData;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });
    logger.info('🟢UPDATED to  ', subscription.status);

    const subscriptionData: Subscription = {
      id: subscription.id,
      userId: uuid,
      metadata: subscription.metadata,
      //@ts-ignore
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      //@ts-ignore
      quantity: subscription.quantity,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at
        ? toDateTime(subscription.cancel_at).toISOString()
        : undefined,
      canceledAt: subscription.canceled_at
        ? toDateTime(subscription.canceled_at).toISOString()
        : undefined,
      currentPeriodStart: toDateTime(
        subscription.current_period_start
      ).toISOString(),
      currentPeriodEnd: toDateTime(
        subscription.current_period_end
      ).toISOString(),
      endedAt: subscription.ended_at
        ? toDateTime(subscription.ended_at).toISOString()
        : undefined,
      trialStart: subscription.trial_start
        ? toDateTime(subscription.trial_start).toISOString()
        : undefined,
      trialEnd: subscription.trial_end
        ? toDateTime(subscription.trial_end).toISOString()
        : undefined,
    };
    const existingSubscription = await DatabaseService.getSubscriptionById(subscriptionData.id);
    if (existingSubscription) {
      await DatabaseService.updateSubscription(subscriptionData.id, subscriptionData);
    } else {
      await DatabaseService.createSubscription(subscriptionData);
    }
    logger.debug(`Inserted/updated subscription [${subscription.id}] for user [${uuid}]`);
    if (createAction && subscription.default_payment_method && uuid) {
      await copyBillingDetailsToCustomer(
        uuid,
        subscription.default_payment_method as Stripe.PaymentMethod
      );
    }
  } catch (error) {
    throw error;
  }
};
