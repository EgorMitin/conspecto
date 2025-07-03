import Stripe from 'stripe';
import type { Subscription, Product, Price } from '@/types/Subscriptions';
import { stripe } from './stripe';
import { createCustomer, createPrice, createProduct, createSubscription, getCustomerById, getCustomerByStripeId, getPriceById, getProductById, getSubscriptionById, updatePrice, updateProduct, updateSubscription } from '../server_actions/subscriptions';
import { logger } from '@/utils/logger';
import { updateUserPaymentData } from '../server_actions/users';


export async function upsertProductRecord(product: Stripe.Product) {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? '',
    image: product.images?.[0] ?? '',
    metadata: product.metadata,
  };
  try {
    const { data, error } = await getProductById(productData.id)
    if (error !== null) {
      await createProduct(productData)
    } else {
      await updateProduct(product.id, productData)
    }
  } catch (error) {
    throw new Error();
  }
  logger.info('Product inserted/updates:', product.id);
};

export async function upsertPriceRecord(price: Stripe.Price) {
  logger.debug('PRICE', price);
  const priceData: Price = {
    id: price.id,
    productId: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? '',
    type: price.type,
    unitAmount: price.unit_amount ?? 0,
    interval: price.recurring?.interval ?? 'month',
    intervalCount: price.recurring?.interval_count,
    trialPeriodDays: price.recurring?.trial_period_days ?? 0,
    metadata: price.metadata,
  };
  try {
    const { error } = await getPriceById(price.id)
    if (error !== null) {
      await createPrice(priceData)
    } else {
      await updatePrice(price.id, priceData)
    }
  } catch (error) {
    throw new Error(`Could not insert/update the price ${error}`);
  }
  logger.info(`Price inserted/updated: ${price.id}`);
};

export async function createOrRetrieveCustomer({ email, uuid, }: { email: string; uuid: string; }) {
  try {
    const { data, error } = await getCustomerById(uuid)
    if (error !== null) throw new Error();
    return data.stripeCustomerId;
  } catch (error) {
    const customerData = { email }
    try {
      const customer = await stripe.customers.create(customerData);
      await createCustomer({ id: uuid, stripeCustomerId: customer.id })
      logger.info(`New customer created and inserted for ${uuid}.`);
      return customer.id;
    } catch (stripeError) {
      throw new Error('Could not create Customer or find the customer');
    }
  }
};

export async function copyBillingDetailsToCustomer(uuid: string, payment_method: Stripe.PaymentMethod) {
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore adress will always be provided (or we don't care)
  await stripe.customers.update(customer, { name, phone, address });
  try {
    await updateUserPaymentData(
      uuid,
      { ...payment_method[payment_method.type] },
      { ...address },
    )
  } catch (error) {
    throw new Error('Couldnot copy customer billing details');
  }
};

export async function manageSubscriptionStatusChange(subscriptionId: string, customerId: string, createAction = false) {
  try {
    const { data, error } = await getCustomerByStripeId(customerId)
    if (error !== null) throw new Error('Cannot find the customer');
    const { id: uuid } = data;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });
    logger.info('UPDATED to  ', subscription.status);

    const subscriptionData: Subscription = {
      id: subscription.id,
      userId: uuid,
      metadata: subscription.metadata,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
      created: new Date(subscription.created * 1000),
      currentPeriodStart: new Date(subscription.billing_cycle_anchor * 1000),
      currentPeriodEnd: subscription.items.data[0].price.recurring ? new Date(new Date(subscription.billing_cycle_anchor * 1000).setMonth(new Date(subscription.billing_cycle_anchor * 1000).getMonth() + (subscription.items.data[0].price.recurring.interval_count || 1))) : undefined,
      endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : undefined,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
    };
    try {
      await createSubscription(subscriptionData);
      logger.info(`Inserted subscription [${subscription.id}] for user [${uuid}]`);
    } catch (error) {
      // Assuming a unique constraint violation will throw an error
      logger.warn('Subscription already exists, updating it instead.');
      await updateSubscription(subscriptionId, subscriptionData);
      logger.info(`Updated subscription [${subscription.id}] for user [${uuid}]`);
    }

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
