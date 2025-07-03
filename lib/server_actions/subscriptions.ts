'use server';

import DatabaseService from "@/services/DatabaseService";
import { Customer, Subscription, Product, Price, ProductWithPrice } from "@/types/Subscriptions";

// ===== SUBSCRIPTION ACTIONS =====

export async function createSubscription(subscription: Subscription): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const newSubscription = await DatabaseService.createSubscription(subscription);
    return { data: newSubscription, error: null };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { data: null, error: 'Failed to create subscription' };
  }
}

export async function getSubscriptionById(id: string): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const subscription = await DatabaseService.getSubscriptionById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    return { data: subscription, error: null };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { data: null, error: 'Failed to fetch subscription' };
  }
}

export async function getSubscriptionsByUserId(userId: string): Promise<{ data: Subscription[]; error: null } | { data: null; error: string }> {
  try {
    const subscriptions = await DatabaseService.getSubscriptionsByUserId(userId);
    return { data: subscriptions, error: null };
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return { data: null, error: 'Failed to fetch user subscriptions' };
  }
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const updatedSubscription = await DatabaseService.updateSubscription(id, updates);
    if (!updatedSubscription) {
      throw new Error('Subscription not found or failed to update');
    }
    return { data: updatedSubscription, error: null };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { data: null, error: 'Failed to update subscription' };
  }
}

export async function deleteSubscription(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await DatabaseService.deleteSubscription(id);
    if (!deleted) {
      throw new Error('Subscription not found or failed to delete');
    }
    return { success: true, message: "Subscription deleted successfully" };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return { success: false, message: "Failed to delete subscription" };
  }
}

// ===== CUSTOMER ACTIONS =====

export async function createCustomer(customer: Customer): Promise<{ data: Customer; error: null } | { data: null; error: string }> {
  try {
    const newCustomer = await DatabaseService.createCustomer(customer);
    return { data: newCustomer, error: null };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { data: null, error: 'Failed to create customer' };
  }
}

export async function getCustomerById(id: string): Promise<{ data: Customer; error: null } | { data: null; error: string }> {
  try {
    const customer = await DatabaseService.getCustomerById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return { data: customer, error: null };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { data: null, error: 'Failed to fetch customer' };
  }
}

export async function getCustomerByStripeId(stripeCustomerId: string): Promise<{ data: Customer; error: null } | { data: null; error: string }> {
  try {
    const customer = await DatabaseService.getCustomerByStripeId(stripeCustomerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return { data: customer, error: null };
  } catch (error) {
    console.error("Error fetching customer by Stripe ID:", error);
    return { data: null, error: 'Failed to fetch customer' };
  }
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await DatabaseService.deleteCustomer(id);
    if (!deleted) {
      throw new Error('Customer not found or failed to delete');
    }
    return { success: true, message: "Customer deleted successfully" };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, message: "Failed to delete customer" };
  }
}

// ===== PRODUCT ACTIONS =====

export async function createProduct(product: Product): Promise<{ data: Product; error: null } | { data: null; error: string }> {
  try {
    const newProduct = await DatabaseService.createProduct(product);
    return { data: newProduct, error: null };
  } catch (error) {
    console.error("Error creating product:", error);
    return { data: null, error: 'Failed to create product' };
  }
}

export async function getProductById(id: string): Promise<{ data: Product; error: null } | { data: null; error: string }> {
  try {
    const product = await DatabaseService.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return { data: product, error: null };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { data: null, error: 'Failed to fetch product' };
  }
}

export async function getActiveProducts(): Promise<{ data: Product[]; error: null } | { data: null; error: string }> {
  try {
    const products = await DatabaseService.getActiveProducts();
    return { data: products, error: null };
  } catch (error) {
    console.error("Error fetching active products:", error);
    return { data: null, error: 'Failed to fetch active products' };
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product; error: null } | { data: null; error: string }> {
  try {
    const updatedProduct = await DatabaseService.updateProduct(id, updates);
    if (!updatedProduct) {
      throw new Error('Product not found or failed to update');
    }
    return { data: updatedProduct, error: null };
  } catch (error) {
    console.error("Error updating product:", error);
    return { data: null, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await DatabaseService.deleteProduct(id);
    if (!deleted) {
      throw new Error('Product not found or failed to delete');
    }
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product" };
  }
}

// ===== PRICE ACTIONS =====

export async function createPrice(price: Price): Promise<{ data: Price; error: null } | { data: null; error: string }> {
  try {
    const newPrice = await DatabaseService.createPrice(price);
    return { data: newPrice, error: null };
  } catch (error) {
    console.error("Error creating price:", error);
    return { data: null, error: 'Failed to create price' };
  }
}

export async function getPriceById(id: string): Promise<{ data: Price; error: null } | { data: null; error: string }> {
  try {
    const price = await DatabaseService.getPriceById(id);
    if (!price) {
      throw new Error('Price not found');
    }
    return { data: price, error: null };
  } catch (error) {
    console.error("Error fetching price:", error);
    return { data: null, error: 'Failed to fetch price' };
  }
}

export async function getPricesByProductId(productId: string): Promise<{ data: Price[]; error: null } | { data: null; error: string }> {
  try {
    const prices = await DatabaseService.getPricesByProductId(productId);
    return { data: prices, error: null };
  } catch (error) {
    console.error("Error fetching prices for product:", error);
    return { data: null, error: 'Failed to fetch prices for product' };
  }
}

export async function getActivePrices(): Promise<{ data: Price[]; error: null } | { data: null; error: string }> {
  try {
    const prices = await DatabaseService.getActivePrices();
    return { data: prices, error: null };
  } catch (error) {
    console.error("Error fetching active prices:", error);
    return { data: null, error: 'Failed to fetch active prices' };
  }
}

export async function updatePrice(id: string, updates: Partial<Price>): Promise<{ data: Price; error: null } | { data: null; error: string }> {
  try {
    const updatedPrice = await DatabaseService.updatePrice(id, updates);
    if (!updatedPrice) {
      throw new Error('Price not found or failed to update');
    }
    return { data: updatedPrice, error: null };
  } catch (error) {
    console.error("Error updating price:", error);
    return { data: null, error: 'Failed to update price' };
  }
}

export async function deletePrice(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await DatabaseService.deletePrice(id);
    if (!deleted) {
      throw new Error('Price not found or failed to delete');
    }
    return { success: true, message: "Price deleted successfully" };
  } catch (error) {
    console.error("Error deleting price:", error);
    return { success: false, message: "Failed to delete price" };
  }
}

// ===== COMBINED ACTIONS =====

export async function getProductsWithPrices(): Promise<{ data: ProductWithPrice[]; error: null } | { data: null; error: string }> {
  try {
    const productsWithPrices = await DatabaseService.getProductsWithPrices();
    return { data: productsWithPrices, error: null };
  } catch (error) {
    console.error("Error fetching products with prices:", error);
    return { data: null, error: 'Failed to fetch products with prices' };
  }
}

export async function getProductWithPrices(productId: string): Promise<{ data: ProductWithPrice; error: null } | { data: null; error: string }> {
  try {
    const productWithPrices = await DatabaseService.getProductWithPrices(productId);
    if (!productWithPrices) {
      throw new Error('Product not found');
    }
    return { data: productWithPrices, error: null };
  } catch (error) {
    console.error("Error fetching product with prices:", error);
    return { data: null, error: 'Failed to fetch product with prices' };
  }
}

// ===== HELPER ACTIONS =====

export async function getUserActiveSubscription(userId: string): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const subscription = await DatabaseService.getUserActiveSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found for user');
    }
    return { data: subscription, error: null };
  } catch (error) {
    console.error("Error fetching user active subscription:", error);
    return { data: null, error: 'Failed to fetch user active subscription' };
  }
}

export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const updatedSubscription = await DatabaseService.updateSubscription(subscriptionId, {
      cancelAtPeriodEnd: true
    });
    if (!updatedSubscription) {
      throw new Error('Subscription not found or failed to update');
    }
    return { data: updatedSubscription, error: null };
  } catch (error) {
    console.error("Error canceling subscription at period end:", error);
    return { data: null, error: 'Failed to cancel subscription' };
  }
}

export async function reactivateSubscription(subscriptionId: string): Promise<{ data: Subscription; error: null } | { data: null; error: string }> {
  try {
    const updatedSubscription = await DatabaseService.updateSubscription(subscriptionId, {
      cancelAtPeriodEnd: false
    });
    if (!updatedSubscription) {
      throw new Error('Subscription not found or failed to update');
    }
    return { data: updatedSubscription, error: null };
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return { data: null, error: 'Failed to reactivate subscription' };
  }
}

// ===== VALIDATION HELPERS =====

export async function hasActiveSubscription(userId: string): Promise<{ data: boolean; error: null } | { data: null; error: string }> {
  try {
    const subscription = await DatabaseService.getUserActiveSubscription(userId);
    return { data: !!subscription, error: null };
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return { data: null, error: 'Failed to check subscription status' };
  }
}

export async function getSubscriptionStatus(userId: string): Promise<{ data: { hasSubscription: boolean; subscription: Subscription | null }; error: null } | { data: null; error: string }> {
  try {
    const subscription = await DatabaseService.getUserActiveSubscription(userId);
    return { 
      data: { 
        hasSubscription: !!subscription, 
        subscription: subscription 
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return { data: null, error: 'Failed to get subscription status' };
  }
}