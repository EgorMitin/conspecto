import { BaseRepository } from './BaseRepository';
import { Customer, Subscription } from '@/types/Subscription';

export class SubscriptionRepository extends BaseRepository {
  /**
   * Create a new subscription
   */
  public async createSubscription(subscription: Subscription): Promise<Subscription> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO subscriptions (
          id, user_id, status, metadata, price, quantity, cancel_at_period_end,
          created, current_period_start, current_period_end, ended_at,
          cancel_at, canceled_at, trial_start, trial_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, user_id as "userId", status, metadata, price, quantity,
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
          subscription.price,
          subscription.quantity,
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
      `SELECT id, user_id as "userId", status, metadata, price, quantity,
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
      `SELECT id, user_id as "userId", status, metadata, price, quantity,
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
        RETURNING id, user_id as "userId", status, metadata, price, quantity,
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
}
