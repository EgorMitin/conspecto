import { BaseRepository } from './BaseRepository';
import type { User, UserData } from '@/types/User';
import type { Subscription } from '@/types/Subscriptions';
import type { CreateUserInput, UpdateUserInput } from './types';
import { AppFolderType } from '@/lib/providers/app-state-provider';

export class UserRepository extends BaseRepository {
  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserInput): Promise<User> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const { rows } = await client.query(
        `INSERT INTO users (email, username, hashed_password, salt, profile_photo_url, preferences, user_tags, is_verified, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, email, username, profile_photo_url as "profilePhotoUrl",
              preferences, user_tags as "userTags",
              created_at as "createdAt", updated_at as "updatedAt"`,
        [
          userData.email,
          userData.username,
          userData.hashedPassword,
          userData.salt,
          userData.profilePhotoUrl,
          userData.preferences || {},
          userData.userTags,
          userData.isVerified,
          now,
          now
        ]
      );
      return rows[0];
    });
  }

  /**
   * Get active subscription for a user
   */
  public async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, user_id as "userId", status, metadata, price_id as "priceId",
              cancel_at_period_end as "cancelAtPeriodEnd", created,
              current_period_start as "currentPeriodStart",
              current_period_end as "currentPeriodEnd",
              ended_at as "endedAt", cancel_at as "cancelAt",
              canceled_at as "canceledAt", trial_start as "trialStart",
              trial_end as "trialEnd"
      FROM subscriptions
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created DESC
      LIMIT 1`,
      [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get a user by ID
   */
  public async getUserById(id: string): Promise<User | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, email, username, profile_photo_url as "profilePhotoUrl",
              preferences, user_tags as "userTags",
              created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    const subscription = await this.getUserActiveSubscription(id);
    return { ...rows[0], subscriptionPlan: subscription };
  }

  /**
   * Get a user by email
   * Include hashed_password and salt for authentication purposes server-side
   */
  public async getUserByEmail(email: string): Promise<(UserData & { hashedPassword: string, salt: string }) | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, email, username, hashed_password as "hashedPassword", salt,
              profile_photo_url as "profilePhotoUrl",
              preferences, user_tags as "userTags", is_verified as "isVerified",
              created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1`,
      [email]
    );
    if (rows.length === 0) return null;

    const subscription = await this.getUserActiveSubscription(rows[0].id);
    return { ...rows[0], subscriptionPlan: subscription };
  }

  /**
   * Update a user
   * Password updates are handled separately with salt and hashing.
   * Payment method updates are also handled separately.
   */
  public async updateUser(id: string, updates: UpdateUserInput): Promise<User | null> {
    const { setClause, values, nextParamIndex } = this.buildUpdateSetClause(
      updates,
      1
    );

    if (!setClause) {
      return this.getUserById(id);
    }

    const finalSetClause = `${setClause}, updated_at = $${nextParamIndex}`;
    const finalValues = [...values, new Date(), id];

    return this.executeInTransaction(async (client) => {
      const queryText = `
        UPDATE users
        SET ${finalSetClause}
        WHERE id = $${nextParamIndex + 1}
        RETURNING id, email, username, profile_photo_url as "profilePhotoUrl",
                  preferences, user_tags as "userTags",
                  created_at as "createdAt", updated_at as "updatedAt"`;

      const { rows } = await client.query(queryText, finalValues);
      if (rows.length === 0) return null;

      const subscription = await this.getUserActiveSubscription(id);
      return { ...rows[0], subscriptionPlan: subscription };
    });
  }

  /**
   * Updates a user's hashed password and salt.
   * This method expects the new password to be already hashed and a new salt to be provided.
   */
  public async updateUserAuthCredentials(userId: string, newHashedPassword: string, newSalt: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const result = await client.query(
        `UPDATE users
         SET hashed_password = $1, salt = $2, updated_at = $3
         WHERE id = $4`,
        [newHashedPassword, newSalt, now, userId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Updates a user's payment method and billing address.
   */
  public async updateUserPaymentData(
    userId: string,
    newPaymentMethod: Record<string, any>,
    newBillingAddress: Record<string, any>
  ): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const now = new Date();
      const result = await client.query(
        `UPDATE users
          SET payment_method = $1, billing_address = $2, updated_at = $3
          WHERE id = $4`,
        [JSON.stringify(newPaymentMethod), JSON.stringify(newBillingAddress), now, userId]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Get a user's payment data by id
   * Include billing address and payment method for payment purposes server-side
   */
  public async getUserPaymentDataById(id: string): Promise<(UserData & { billingAddress: Record<string, any>, paymentMethod: Record<string, any> }) | null> {
    const { rows } = await this.executeQuery(
      `SELECT id, email, username, billing_address as "billingAddress", payment_method as "paymentMethod",
              profile_photo_url as "profilePhotoUrl",
              preferences, user_tags as "userTags", is_verified as "isVerified",
              created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;

    const subscription = await this.getUserActiveSubscription(id);
    return { ...rows[0], subscriptionPlan: subscription };
  }

  /**
   * Delete a user by ID
   */
  public async deleteUser(id: string): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM users WHERE id = $1`,
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    });
  }

  /**
   * Create OAuth account for user
   */
  public async createUserOAuthAccount(userId: string, provider: string, providerAccountId: string): Promise<void> {
    return this.executeInTransaction(async (client) => {
      const existingQuery = `
        SELECT user_id as "userId", provider, provider_account_id as "providerAccountId",
              created_at as "createdAt", updated_at as "updatedAt"
        FROM user_oauth_accounts
        WHERE user_id = $1 AND provider = $2 AND provider_account_id = $3
      `;

      const { rows: existingAccounts } = await client.query(existingQuery, [userId, provider, providerAccountId]);

      if (existingAccounts.length > 0) {
        return;
      }

      const now = new Date();
      await client.query(
        `INSERT INTO user_oauth_accounts (user_id, provider, provider_account_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, provider, providerAccountId, now, now]
      );
    });
  }

  /**
   * Create verification token for user
   */
  public async createVerificationToken(userId: string, token: string, expiresAt: Date): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      await client.query(
        `UPDATE users
        SET verification_token = $1, token_expires_at = $2
        WHERE id = $3`,
        [token, expiresAt, userId]
      );
      return true;
    });
  }

  /**
   * Verify a user with token
   */
  public async verifyUser(token: string): Promise<string | null> {
    return this.executeInTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE users
        SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL
        WHERE verification_token = $1 AND token_expires_at > NOW()
        RETURNING id`,
        [token]
      );
      return rows.length > 0 ? rows[0].id : null;
    });
  }

  /**
   * Get the entire application state (folders, notes, questions, AI reviews) for a user.
   * Fetches all data in a single query using PostgreSQL JSON aggregation.
   */
  public async getAppStateByUserId(userId: string): Promise<AppFolderType[]> {
    const query = `
      SELECT
        f.id,
        f.user_id AS "userId",
        f.name,
        f.icon_id AS "iconId",
        f.in_trash AS "inTrash",
        f.logo,
        f.banner_url AS "bannerUrl",
        f.created_at AS "createdAt",
        f.updated_at AS "updatedAt",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', n.id,
                'userId', n.user_id,
                'folderId', n.folder_id,
                'title', n.title,
                'content', n.content,
                'contentPlainText', n.content_plain_text,
                'tags', n.tags,
                'isPublic', n.is_public,
                'iconId', n.icon_id,
                'bannerUrl', n.banner_url,
                'status', n.status,
                'metadata', n.metadata,
                'repetition', n.repetition,
                'interval', n.interval,
                'easeFactor', n.ease_factor,
                'nextReview', n.next_review,
                'lastReview', n.last_review,
                'history', n.history,
                'createdAt', n.created_at,
                'updatedAt', n.updated_at,
                'questions', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', q.id,
                        'noteId', q.note_id,
                        'userId', q.user_id,
                        'question', q.question,
                        'answer', q.answer,
                        'timeStamp', q.time_stamp,
                        'repetition', q.repetition,
                        'interval', q.interval,
                        'easeFactor', q.ease_factor,
                        'nextReview', q.next_review,
                        'lastReview', q.last_review,
                        'history', q.history
                      ) ORDER BY q.time_stamp ASC
                    )
                    FROM questions q
                    WHERE q.note_id = n.id
                  ),
                  '[]'::json
                ),
                'aiReviews', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', ar.id,
                        'userId', ar.user_id,
                        'sourceId', ar.source_id,
                        'sourceType', ar.source_type,
                        'status', ar.status,
                        'mode', ar.mode,
                        'difficulty', ar.difficulty,
                        'summary', ar.summary,
                        'keyTakeaways', ar.key_takeaways,
                        'generatedQuestions', ar.generated_questions,
                        'result', ar.result,
                        'modelVersion', ar.model_version,
                        'errorMessage', ar.error_message,
                        'requestedAt', ar.requested_at,
                        'questionsGeneratedAt', ar.questions_generated_at,
                        'sessionStartedAt', ar.session_started_at,
                        'completedAt', ar.completed_at
                      ) ORDER BY ar.requested_at ASC
                    )
                    FROM ai_review_sessions ar
                    WHERE ar.source_id = n.id
                  ),
                  '[]'::json
                )
              ) ORDER BY n.updated_at DESC
            )
            FROM notes n
            WHERE n.folder_id = f.id
          ),
          '[]'::json
        ) AS notes,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', ar.id,
                'userId', ar.user_id,
                'sourceId', ar.source_id,
                'sourceType', ar.source_type,
                'status', ar.status,
                'mode', ar.mode,
                'difficulty', ar.difficulty,
                'summary', ar.summary,
                'keyTakeaways', ar.key_takeaways,
                'generatedQuestions', ar.generated_questions,
                'result', ar.result,
                'modelVersion', ar.model_version,
                'errorMessage', ar.error_message,
                'requestedAt', ar.requested_at,
                'questionsGeneratedAt', ar.questions_generated_at,
                'sessionStartedAt', ar.session_started_at,
                'completedAt', ar.completed_at
              ) ORDER BY ar.requested_at ASC
            )
            FROM ai_review_sessions ar
            WHERE ar.source_id = f.id
          ),
          '[]'::json
        ) AS "aiReviews"
      FROM
        folders f
      WHERE
        f.user_id = $1
      ORDER BY
        f.created_at ASC;
    `;

    const { rows } = await this.executeQuery(query, [userId]);
    return rows as AppFolderType[];
  }
}