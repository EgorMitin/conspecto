import { BaseRepository } from './BaseRepository';
import { Customer, Subscription, Product, Price, ProductWithPrice } from '@/types/Subscriptions';

export class SubscriptionRepository extends BaseRepository {
  /**
   * Create a new subscription
   */
  public async createSubscription(subscription: Subscription): Promise<Subscription> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO subscriptions (
          id, user_id, status, metadata, price_id, cancel_at_period_end,
          created, current_period_start, current_period_end, ended_at,
          cancel_at, canceled_at, trial_start, trial_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, user_id as "userId", status, metadata, price_id as "priceId",
                  cancel_at_period_end as "cancelAtPeriodEnd", created,
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  ended_at as "endedAt", cancel_at as "cancelAt",
                  canceled_at as "canceledAt", trial_start as "trialStart",
                  trial_end as "trialEnd"`,
        [
          subscription.id,
          subscription.userId,
          subscription.status,
          JSON.stringify(subscription.metadata || {}),
          subscription.priceId,
          subscription.cancelAtPeriodEnd,
          subscription.created || new Date().toISOString(),
          subscription.currentPeriodStart || new Date().toISOString(),
          subscription.currentPeriodEnd || new Date().toISOString(),
          subscription.endedAt,
          subscription.cancelAt,
          subscription.canceledAt,
          subscription.trialStart,
          subscription.trialEnd
        ]
      );

      return rows[0];
    });
  }

  /**
   * Get subscription by ID
   */
  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", status, metadata, price_id as "priceId",
              cancel_at_period_end as "cancelAtPeriodEnd", created,
              current_period_start as "currentPeriodStart",
              current_period_end as "currentPeriodEnd",
              ended_at as "endedAt", cancel_at as "cancelAt",
              canceled_at as "canceledAt", trial_start as "trialStart",
              trial_end as "trialEnd"
      FROM subscriptions
      WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get subscriptions for a user
   */
  public async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", status, metadata, price_id as "priceId",
              cancel_at_period_end as "cancelAtPeriodEnd", created,
              current_period_start as "currentPeriodStart",
              current_period_end as "currentPeriodEnd",
              ended_at as "endedAt", cancel_at as "cancelAt",
              canceled_at as "canceledAt", trial_start as "trialStart",
              trial_end as "trialEnd"
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY created DESC`,
      [userId]
    );

    return rows;
  }

  /**
   * Update a subscription
   */
  public async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getSubscriptionById(id);
    }

    const finalValues = [...values, id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE subscriptions
        SET ${setClause}
        WHERE id = $${nextParamIndex}
        RETURNING id, user_id as "userId", status, metadata, price_id as "priceId",
                  cancel_at_period_end as "cancelAtPeriodEnd", created,
                  current_period_start as "currentPeriodStart",
                  current_period_end as "currentPeriodEnd",
                  ended_at as "endedAt", cancel_at as "cancelAt",
                  canceled_at as "canceledAt", trial_start as "trialStart",
                  trial_end as "trialEnd"`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Delete a subscription
   */
  public async deleteSubscription(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM subscriptions WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Create a new customer
   */
  public async createCustomer(customer: Customer): Promise<Customer> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO customers (id, stripe_customer_id)
        VALUES ($1, $2)
        RETURNING id, stripe_customer_id as "stripeCustomerId"`,
        [customer.id, customer.stripeCustomerId]
      );

      return rows[0];
    });
  }

  /**
   * Get customer by ID
   */
  public async getCustomerById(id: string): Promise<Customer | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, stripe_customer_id as "stripeCustomerId"
      FROM customers
      WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get customer by Stripe customer ID
   */
  public async getCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, stripe_customer_id as "stripeCustomerId"
      FROM customers
      WHERE stripe_customer_id = $1`,
      [stripeCustomerId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Delete a customer
   */
  public async deleteCustomer(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM customers WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  // ===== PRODUCT METHODS =====

  /**
   * Create a new product
   */
  public async createProduct(product: Product): Promise<Product> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO products (id, active, name, description, image, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, active, name, description, image, metadata`,
        [
          product.id,
          product.active,
          product.name,
          product.description,
          product.image,
          JSON.stringify(product.metadata || {})
        ]
      );

      return rows[0];
    });
  }

  /**
   * Get product by ID
   */
  public async getProductById(id: string): Promise<Product | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, active, name, description, image, metadata
      FROM products
      WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all active products
   */
  public async getActiveProducts(): Promise<Product[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, active, name, description, image, metadata
      FROM products
      WHERE active = true
      ORDER BY name ASC`
    );

    return rows;
  }

  /**
   * Update a product
   */
  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getProductById(id);
    }

    const finalValues = [...values, id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE products
        SET ${setClause}
        WHERE id = $${nextParamIndex}
        RETURNING id, active, name, description, image, metadata`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Delete a product
   */
  public async deleteProduct(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM products WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  // ===== PRICE METHODS =====

  /**
   * Create a new price
   */
  public async createPrice(price: Price): Promise<Price> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO prices (id, product_id, description, active, unit_amount, currency, type, interval, interval_count, trial_period_days, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, product_id as "productId", description, active,
                  unit_amount as "unitAmount", currency, type, interval,
                  interval_count as "intervalCount", trial_period_days as "trialPeriodDays", metadata`,
        [
          price.id,
          price.productId,
          price.description,
          price.active,
          price.unitAmount,
          price.currency || 'USD',
          price.type,
          price.interval,
          price.intervalCount,
          price.trialPeriodDays,
          JSON.stringify(price.metadata || {})
        ]
      );

      return rows[0];
    });
  }

  /**
   * Get price by ID
   */
  public async getPriceById(id: string): Promise<Price | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, product_id as "productId", description, active,
              unit_amount as "unitAmount", currency, type, interval,
              interval_count as "intervalCount", trial_period_days as "trialPeriodDays", metadata
      FROM prices
      WHERE id = $1`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get prices for a product
   */
  public async getPricesByProductId(productId: string): Promise<Price[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, product_id as "productId", description, active,
              unit_amount as "unitAmount", currency, type, interval,
              interval_count as "intervalCount", trial_period_days as "trialPeriodDays", metadata
      FROM prices
      WHERE product_id = $1
      ORDER BY unit_amount ASC`,
      [productId]
    );

    return rows;
  }

  /**
   * Get all active prices
   */
  public async getActivePrices(): Promise<Price[]> {
    const { rows } = await this.executeQuery(
      `SELECT id, product_id as "productId", description, active,
              unit_amount as "unitAmount", currency, type, interval,
              interval_count as "intervalCount", trial_period_days as "trialPeriodDays", metadata
      FROM prices
      WHERE active = true
      ORDER BY unit_amount ASC`
    );

    return rows;
  }

  /**
   * Update a price
   */
  public async updatePrice(id: string, updates: Partial<Price>): Promise<Price | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getPriceById(id);
    }

    const finalValues = [...values, id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE prices
        SET ${setClause}
        WHERE id = $${nextParamIndex}
        RETURNING id, product_id as "productId", description, active,
                  unit_amount as "unitAmount", currency, type, interval,
                  interval_count as "intervalCount", trial_period_days as "trialPeriodDays", metadata`;

      const { rows } = await client.query(queryText, finalValues);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  /**
   * Delete a price
   */
  public async deletePrice(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM prices WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Get products with their prices
   */
  public async getProductsWithPrices(): Promise<ProductWithPrice[]> {
    const { rows } = await this.executeQuery(
      `SELECT
        p.id, p.active, p.name, p.description, p.image, p.metadata,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pr.id,
              'productId', pr.product_id,
              'description', pr.description,
              'active', pr.active,
              'unitAmount', pr.unit_amount,
              'currency', pr.currency,
              'type', pr.type,
              'interval', pr.interval,
              'intervalCount', pr.interval_count,
              'trialPeriodDays', pr.trial_period_days,
              'metadata', pr.metadata
            ) ORDER BY pr.unit_amount ASC
          ) FILTER (WHERE pr.id IS NOT NULL),
          '[]'::json
        ) as prices
      FROM products p
      LEFT JOIN prices pr ON p.id = pr.product_id AND pr.active = true
      WHERE p.active = true
      GROUP BY p.id, p.active, p.name, p.description, p.image, p.metadata
      ORDER BY p.name ASC`
    );

    return rows.map(row => ({
      ...row,
      prices: row.prices || []
    }));
  }

  /**
   * Get a single product with its prices
   */
  public async getProductWithPrices(productId: string): Promise<ProductWithPrice | null> {
    const { rows } = await this.executeQuery(
      `SELECT
        p.id, p.active, p.name, p.description, p.image, p.metadata,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pr.id,
              'productId', pr.product_id,
              'description', pr.description,
              'active', pr.active,
              'unitAmount', pr.unit_amount,
              'currency', pr.currency,
              'type', pr.type,
              'interval', pr.interval,
              'intervalCount', pr.interval_count,
              'trialPeriodDays', pr.trial_period_days,
              'metadata', pr.metadata
            ) ORDER BY pr.unit_amount ASC
          ) FILTER (WHERE pr.id IS NOT NULL),
          '[]'::json
        ) as prices
      FROM products p
      LEFT JOIN prices pr ON p.id = pr.product_id AND pr.active = true
      WHERE p.id = $1
      GROUP BY p.id, p.active, p.name, p.description, p.image, p.metadata`,
      [productId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      ...rows[0],
      prices: rows[0].prices || []
    };
  }
}
