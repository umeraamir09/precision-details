import { Resend } from 'resend';

/**
 * Get a Resend client instance.
 * Lazily initializes the client to avoid build-time errors when API key is not set.
 * @throws Error if RESEND_API_KEY environment variable is not configured
 */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(apiKey);
}

/**
 * Default "from" address for all emails
 */
export const EMAIL_FROM = 'Precision Details <noreply@umroo.art>';

/**
 * Get the owner email for notifications
 */
export function getOwnerEmail(): string {
  return process.env.CONTACT_TO?.split(',')?.[0] || 'detailswithprecision@gmail.com';
}

/**
 * Get the brand logo URL for emails
 */
export function getBrandLogoUrl(): string {
  return process.env.PUBLIC_BRAND_LOGO_URL || 'https://raw.githubusercontent.com/umeraamir09/precision-details/refs/heads/master/public/branding/logo.png';
}
