import { env } from "process";
import { google } from "googleapis";
import crypto from "crypto";
import { cookies } from "next/headers";
import { logger } from "@/utils/logger";
import { User } from "@/types/User";


export interface OAuthUserData {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  displayName?: string;
  username?: string;
  picture?: string;
  profile?: string;
  avatar_url?: string;
  [key: string]: unknown;
}


export class OAuthClient<T> {
  private get redirectURL() {
    return new URL("google", env.OAUTH_REDIRECT_URL_BASE);
  }

  private async saveState(state: string) {
    const cookieStore = await cookies();
    if (!env.COOKIE_OAUTH_STATE_KEY) {
      logger.error('COOKIE_OAUTH_STATE_KEY environment variable is not defined');
      throw new Error('COOKIE_OAUTH_STATE_KEY environment variable is not defined');
    }
    cookieStore.set(env.COOKIE_OAUTH_STATE_KEY, state, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }

  private async getStoredState(): Promise<string | undefined> {
    const cookieStore = await cookies();
    if (!env.COOKIE_OAUTH_STATE_KEY) {
      logger.error('COOKIE_OAUTH_STATE_KEY environment variable is not defined');
      throw new Error('COOKIE_OAUTH_STATE_KEY environment variable is not defined');
    }
    const stateCookie = cookieStore.get(env.COOKIE_OAUTH_STATE_KEY);
    return stateCookie?.value;
  }

  public async createAuthUrl(provider: string): Promise<string> {
    if (provider === 'google') {
      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        this.redirectURL.toString()
      );
      
      const scopes = [
        'openid',
        'email',
        'profile'
      ];
      
      const state = crypto.randomBytes(32).toString('hex');

      await this.saveState(state);
      
      const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        state: state
      });
      return authorizationUrl;
    }
    logger.error('Unsupported OAuth provider:', provider);
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  async getOAuthData(provider: string = 'google', state: string, code: string): Promise<T> {
    const storedState = await this.getStoredState();
    if (!storedState || storedState !== state) {
      logger.error('State mismatch, possible CSRF attack');
      throw new Error('Invalid state parameter');
    }

    if (provider === 'google') {
      const oauth2Client = new google.auth.OAuth2(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        this.redirectURL.toString()
      );
      
      try {
        const { tokens } = await oauth2Client.getToken(code);
        
        oauth2Client.setCredentials(tokens);
        
        const oauth2 = google.oauth2({
          auth: oauth2Client,
          version: 'v2'
        });
        
        const { data } = await oauth2.userinfo.get();
        console.log('User data fetched from Google:', data);
        
        return data as unknown as T;
      } catch (error) {
        logger.error('Error fetching user info:', error);
        throw new Error('Failed to fetch user information');
      }
    }
    
    logger.error('Unsupported OAuth provider:', provider);
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  public convertToUser(data: OAuthUserData): User {
    if (typeof data === 'object' && data !== null) {
      console.log('Converting OAuth data to User:', data);
      const user: User = {
        id: data.id || data.sub || '',
        email: data.email || '',
        isVerified: true, // !!data.email_verified, (?)
        subscriptionPlan: null,
        username: data.name || data.displayName || data.username || '' || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
        profilePhotoUrl: data.picture || data.profile || data.avatar_url || '',
      };
      return user;
    }
    logger.error('Invalid OAuth data format:', data);
    throw new Error('Invalid OAuth data format');
  }
}