import { apiClient } from './client';

export interface NotificationPreferences {
  email: boolean;
  in_app: boolean;
  security_alerts: boolean;
  weekly_report: boolean;
}

export interface AccountPreferences {
  timezone: string;
  language: string;
  notifications: NotificationPreferences;
  updated_at: string | null;
}

export interface PreferencesUpdate {
  timezone?: string;
  language?: string;
  notifications?: Partial<NotificationPreferences>;
}

export interface ConnectedProvider {
  provider_id: string;
  email: string | null;
  uid: string;
  display_name: string | null;
  photo_url: string | null;
}

export interface ConnectedAccountsResponse {
  providers: ConnectedProvider[];
  email: string | null;
  email_verified: boolean;
}

export interface SecurityStatusResponse {
  email: string | null;
  email_verified: boolean;
  created_at: number | null;
  last_sign_in_at: number | null;
  providers: ConnectedProvider[];

  // Actual Firebase MFA status.
  two_factor_enabled: boolean;
  two_factor_supported_by_app: boolean;

  // Separate application email-verification setting.
  email_verification_enabled: boolean;
  email_verification_enabled_at: string | null;

  session_management_available: boolean;
  password_reset: string;
}

export interface EmailCodeSendResponse {
  message: string;
}

export interface EmailCodeVerifyResponse {
  email_verification_enabled: boolean;
  email_verification_enabled_at: string;
  message: string;
}

export interface EmailVerificationDisableResponse {
  email_verification_enabled: boolean;
  message: string;
}

/**
 * Load the signed-in user's saved preferences from Firestore.
 */
export async function getAccountPreferences(): Promise<AccountPreferences> {
  const response = await apiClient.get<AccountPreferences>(
    '/account/preferences'
  );

  return response.data;
}

/**
 * Persist preference changes to Firestore.
 */
export async function updateAccountPreferences(
  updates: PreferencesUpdate
): Promise<AccountPreferences> {
  const response = await apiClient.patch<AccountPreferences>(
    '/account/preferences',
    updates
  );

  return response.data;
}

/**
 * Load providers currently linked to the Firebase account.
 */
export async function getConnectedAccounts(): Promise<ConnectedAccountsResponse> {
  const response = await apiClient.get<ConnectedAccountsResponse>(
    '/account/connected-accounts'
  );

  return response.data;
}

/**
 * Load the signed-in user's security status.
 */
export async function getSecurityStatus(): Promise<SecurityStatusResponse> {
  const response = await apiClient.get<SecurityStatusResponse>(
    '/account/security'
  );

  return response.data;
}

/**
 * Request a verification code for the signed-in user's verified email.
 */
export async function sendEmailVerificationCode(): Promise<EmailCodeSendResponse> {
  const response = await apiClient.post<EmailCodeSendResponse>(
    '/account/security/email-code/send'
  );

  return response.data;
}

/**
 * Verify the six-digit code and enable the email-verification setting.
 */
export async function verifyEmailVerificationCode(
  code: string
): Promise<EmailCodeVerifyResponse> {
  const response = await apiClient.post<EmailCodeVerifyResponse>(
    '/account/security/email-code/verify',
    { code }
  );

  return response.data;
}

/**
 * Disable the email-verification setting.
 */
export async function disableEmailVerification(): Promise<EmailVerificationDisableResponse> {
  const response = await apiClient.post<EmailVerificationDisableResponse>(
    '/account/security/email-code/disable'
  );

  return response.data;
}


export interface TotpSetupResponse {
  secret: string;
  qr_code_url: string;
  account_name: string;
  issuer: string;
}

export interface TotpVerifyResponse {
  success: boolean;
  message: string;
  two_factor_enabled: boolean;
}

/**
 * Generate a standard RFC 6238 TOTP setup key and QR code URL
 */
export async function setupTotp(): Promise<TotpSetupResponse> {
  const response = await apiClient.post<TotpSetupResponse>(
    '/account/security/totp/setup'
  );
  return response.data;
}

/**
 * Verify code and enable TOTP two-factor authentication
 */
export async function verifyTotp(code: string): Promise<TotpVerifyResponse> {
  const response = await apiClient.post<TotpVerifyResponse>(
    '/account/security/totp/verify',
    { code }
  );
  return response.data;
}

/**
 * Disable TOTP two-factor authentication
 */
export async function disableTotp(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    '/account/security/totp'
  );
  return response.data;
}

/**
 * Verify 2FA code during login challenge
 */
export async function verifyLogin2FA(
  code: string
): Promise<{ success: boolean; verified: boolean }> {
  const response = await apiClient.post<{ success: boolean; verified: boolean }>(
    '/auth/verify-2fa',
    { code }
  );
  return response.data;
}
