import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // hjyh lehd xlef ldyr
      },
    });
  }

  getVerificationURL(token: string): string {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;
    return verificationUrl
  }

  getEmailVerificationHtml(verificationUrl: string): string {
    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/favicon.png`;
    return (
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Conspecto</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <img src="${logoUrl}" alt="Conspecto Logo" width="48" height="48" style="border-radius:12px; margin-bottom: 16px; box-shadow:0 2px 8px rgba(0,0,0,0.06);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Conspecto</h1>
            <h2 style="color: rgba(255,255,255,0.9); margin: 0; font-size: 22px; font-weight: 400; letter-spacing: -0.3px;">Welcome to Conspecto</h2>
          </div>
          
          <div style="padding: 40px;">
            <div style="margin-bottom: 32px;">
              <h3 style="color: #1d1d1f; margin: 0 0 16px 0; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">Verify your email address</h3>
              <p style="color: #86868b; margin: 0; font-size: 17px; line-height: 1.5;">To complete your account setup and start using Conspecto, please verify your email address by clicking the button below.</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #007aff 0%, #005ecb 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 17px; font-weight: 600; letter-spacing: -0.2px; box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3); transition: all 0.2s ease;">
                Verify Email Address
              </a>
            </div>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f5f5f7;">
              <p style="color: #86868b; margin: 0 0 8px 0; font-size: 15px;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #007aff; text-decoration: none; font-size: 15px;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="margin-top: 32px; padding: 20px; background-color: #f5f5f7; border-radius: 12px;">
              <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                <strong style="color: #1d1d1f;">Security note:</strong> If you didn't create this account, please ignore this email. This verification link will expire in 24 hours.
              </p>
            </div>
          </div>
          
          <div style="padding: 24px 40px; background-color: #f5f5f7; text-align: center;">
            <p style="color: #86868b; margin: 0; font-size: 13px; line-height: 1.4;">
              © ${new Date().getFullYear()} Conspecto. All rights reserved.
            </p>
          </div>
        </div>
        
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 20px !important; }
            .header { padding: 30px 20px 15px 20px !important; }
            .footer { padding: 20px !important; }
            h1 { font-size: 28px !important; }
            h2 { font-size: 20px !important; }
            h3 { font-size: 20px !important; }
          }
        </style>
      </body>
      </html>
        `
    )
  }

  getEmailWelcomeHtml() {
    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/favicon.png`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const shortcuts = '⌘+Opt+M (Mac) or Ctrl+Alt+M (Windows/Linux)'

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Conspecto - Let's Get Started!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f7; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <img src="${logoUrl}" alt="Conspecto Logo" width="48" height="48" style="border-radius:12px; margin-bottom: 16px; box-shadow:0 2px 8px rgba(0,0,0,0.06);" />
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px;">Welcome to Conspecto!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 18px; font-weight: 400;">Your intelligent note-taking journey starts now</p>
        </div>
        
        <!-- Welcome Message -->
        <div style="padding: 40px 40px 20px 40px;">
          <p style="color: #1d1d1f; margin: 0 0 24px 0; font-size: 18px; line-height: 1.5;">
            🎉 Congratulations! Your email has been verified and you're ready to transform how you learn and study.
          </p>
          <p style="color: #86868b; margin: 0 0 32px 0; font-size: 16px; line-height: 1.5;">
            Here's how to get started in just 5 simple steps:
          </p>
        </div>

        <!-- Steps Section -->
        <div style="padding: 0 40px;">
          <!-- Step 1 -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 56px; vertical-align: top; padding-right: 16px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #007aff 0%, #005ecb 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                  <span style="color: white; font-weight: 600; font-size: 18px;">1</span>
                </div>
              </td>
              <td style="vertical-align: top;">
                <h3 style="color: #1d1d1f; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Create Your First Folder</h3>
                <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                  Organize your notes by subject or topic. Click "Create Folder" and give it a name like "Biology", "History", or "Programming".
                </p>
              </td>
            </tr>
          </table>

          <!-- Step 2 -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 56px; vertical-align: top; padding-right: 16px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #34c759 0%, #248a3d 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                  <span style="color: white; font-weight: 600; font-size: 18px;">2</span>
                </div>
              </td>
              <td style="vertical-align: top;">
                <h3 style="color: #1d1d1f; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Create a New Note</h3>
                <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                  Inside your folder, click "Create Note" to start writing. Give your note a descriptive title that reflects what you're learning.
                </p>
              </td>
            </tr>
          </table>

          <!-- Step 3 -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 56px; vertical-align: top; padding-right: 16px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff9500 0%, #cc7700 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                  <span style="color: white; font-weight: 600; font-size: 18px;">3</span>
                </div>
              </td>
              <td style="vertical-align: top;">
                <h3 style="color: #1d1d1f; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Write What You Learn</h3>
                <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                  Use our rich text editor to capture your thoughts, add equations, diagrams, and format your content beautifully.
                </p>
              </td>
            </tr>
          </table>

          <!-- Step 4 -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td style="width: 56px; vertical-align: top; padding-right: 16px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #af52de 0%, #8e44ad 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                  <span style="color: white; font-weight: 600; font-size: 18px;">4</span>
                </div>
              </td>
              <td style="vertical-align: top;">
                <h3 style="color: #1d1d1f; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Mark Important Content as "Questions"</h3>
                <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                  Select any small parts of text you want to remember as flash-cards and mark them as a "questions". This will help you create study materials automatically.
                  You can also use the keyboard shortcut: <strong>${shortcuts}</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Step 5 -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
            <tr>
              <td style="width: 56px; vertical-align: top; padding-right: 16px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff2d92 0%, #d1006e 100%); border-radius: 50%; text-align: center; line-height: 40px;">
                  <span style="color: white; font-weight: 600; font-size: 18px;">5</span>
                </div>
              </td>
              <td style="vertical-align: top;">
                <h3 style="color: #1d1d1f; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Start Your Study Session</h3>
                <p style="color: #86868b; margin: 0; font-size: 15px; line-height: 1.4;">
                  Go to your note's study mode by clicking "Study Note" and choose your preferred study regime - spaced repetition or AI-powered questions.
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0; padding: 0 40px;">
          <a href="${appUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #007aff 0%, #005ecb 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 17px; font-weight: 600; letter-spacing: -0.2px; box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);">
            Start Using Conspecto Now
          </a>
        </div>

        <!-- Features Highlight -->
        <div style="margin: 40px; padding: 24px; background-color: #f5f5f7; border-radius: 12px;">
          <h3 style="color: #1d1d1f; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; text-align: center;">What Makes Conspecto Special?</h3>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 16px;">🧠</span>
              <span style="color: #86868b; font-size: 15px;">AI-powered study questions from your notes</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 16px;">📊</span>
              <span style="color: #86868b; font-size: 15px;">Learning analytics to track your progress</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 16px;">⚡</span>
              <span style="color: #86868b; font-size: 15px;">Spaced repetition for optimal retention</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 16px;">✏️</span>
              <span style="color: #86868b; font-size: 15px;">Rich text editor with math and anything you can dream about</span>
            </div>
          </div>
        </div>

        <!-- Support Section -->
        <div style="margin: 0 40px 40px 40px; padding: 20px; border: 1px solid #e5e5ea; border-radius: 12px;">
          <h3 style="color: #1d1d1f; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Need Help Getting Started?</h3>
          <p style="color: #86868b; margin: 0; font-size: 14px; line-height: 1.4;">
            Visit our <a href="${appUrl}/help" style="color: #007aff; text-decoration: none;">Help Center</a> for tutorials and guides, or reach out to our support team if you have any questions.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px 40px; background-color: #f5f5f7; text-align: center;">
          <p style="color: #86868b; margin: 0; font-size: 13px; line-height: 1.4;">
            © ${new Date().getFullYear()} Conspecto. All rights reserved.
          </p>
        </div>
      </div>
      
      <style>
        @media only screen and (max-width: 600px) {
          .step-container { flex-direction: column !important; }
          .step-number { margin-bottom: 12px !important; margin-right: 0 !important; }
          .content { padding: 20px !important; }
          .header { padding: 30px 20px 15px 20px !important; }
        }
      </style>
    </body>
    </html>
  `;
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = this.getVerificationURL(token)
    const html = this.getEmailVerificationHtml(verificationUrl)

    try {
      await this.transporter.sendMail({
        from: `"Conspecto" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Verify your email for Conspecto',
        html,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string): Promise<boolean> {
    const html = this.getEmailWelcomeHtml()

    try {
      await this.transporter.sendMail({
        from: `"Conspecto" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to Conspecto!',
        html,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}`, error);
      return false;
    }
  }
}

export default new EmailService();