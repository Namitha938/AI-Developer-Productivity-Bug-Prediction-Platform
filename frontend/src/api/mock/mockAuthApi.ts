import { User, UserSession, TwoFactorSetupData } from '../../types';
import { mockCurrentUser, mockUsers } from '../mockData';

// Local storage keys for persistent mock state
const STORAGE_KEY_USER = 'bugpulse_mock_current_user';
const STORAGE_KEY_SESSIONS = 'bugpulse_mock_sessions';
const STORAGE_KEY_2FA_SECRET = 'bugpulse_mock_2fa_secret';
const STORAGE_KEY_BACKUP_CODES = 'bugpulse_mock_backup_codes';

// Initial sessions list
const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-current-01',
    device: 'MacBook Pro 16" (M3 Max)',
    browser: 'Chrome 122.0',
    os: 'macOS Sonoma',
    ip: '192.168.1.104',
    location: 'San Francisco, US',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'sess-mobile-02',
    device: 'iPhone 15 Pro',
    browser: 'Mobile Safari 17.3',
    os: 'iOS 17.4',
    ip: '172.56.21.89',
    location: 'San Francisco, US',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess-work-03',
    device: 'Linux Workstation',
    browser: 'Firefox Developer Edition',
    os: 'Ubuntu 22.04 LTS',
    ip: '198.51.100.42',
    location: 'Austin, US',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

// Seed storage if empty
function getStoredUser(): User {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockCurrentUser));
  return mockCurrentUser;
}

function saveStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function getStoredSessions(): UserSession[] {
  const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  return INITIAL_SESSIONS;
}

function saveStoredSessions(sessions: UserSession[]): void {
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
}

// Generate realistic backup codes (e.g. 8 codes of 8 hex characters: a1b2-c3d4)
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

export type MockLoginResponse =
  | {
      requires2FA: true;
      tempToken: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
      accessToken?: undefined;
      refreshToken?: undefined;
    }
  | {
      requires2FA: false;
      tempToken?: undefined;
      user: User;
      accessToken: string;
      refreshToken: string;
    };

export const mockAuthApi = {
  // 1. Register
  register: async (data: { name: string; email: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 600));

    // Check if email is already taken
    if (data.email.toLowerCase() === 'alex.rivera@codepulse.ai') {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 8),
      name: data.name,
      username: data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      email: data.email.toLowerCase(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      role: 'developer',
      title: 'Software Engineer',
      twoFactorEnabled: false,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };

    saveStoredUser(newUser);

    return {
      success: true,
      user: newUser,
      message: 'Account created successfully. Please verify your email.',
    };
  },

  // 2. Login
  login: async (credentials: { email: string; password: string }): Promise<MockLoginResponse> => {
    await new Promise((r) => setTimeout(r, 650));

    const email = credentials.email.trim().toLowerCase();
    const storedUser = getStoredUser();

    // Check if matches known demo or stored user
    const matchedUser =
      mockUsers.find((u) => u.email.toLowerCase() === email) ||
      (storedUser.email.toLowerCase() === email ? storedUser : null);

    // If non-matching or wrong password check
    if (!matchedUser && !email.includes('@')) {
      throw new Error('Incorrect email or password.');
    }

    // Default password for demo users is 'secret123'
    if (credentials.password !== 'secret123' && credentials.password.length < 6) {
      throw new Error('Incorrect email or password.');
    }

    const user = matchedUser || {
      ...storedUser,
      email,
      name: email.split('@')[0],
      username: email.split('@')[0],
    };

    // If 2FA is enabled on this account, return 2FA challenge
    if (user.twoFactorEnabled) {
      const tempToken = 'temp_2fa_' + Math.random().toString(36).substring(2);
      return {
        requires2FA: true,
        tempToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }

    const accessToken = 'bp_jwt_' + Math.random().toString(36).substring(2);
    const refreshToken = 'bp_refresh_' + Math.random().toString(36).substring(2);

    saveStoredUser(user);
    localStorage.setItem('codepulse_access_token', accessToken);
    localStorage.setItem('codepulse_refresh_token', refreshToken);

    return {
      requires2FA: false,
      user,
      accessToken,
      refreshToken,
    };
  },

  // 3. 2FA Login Verify
  verify2FALogin: async (data: { tempToken: string; code: string; isBackupCode?: boolean }) => {
    await new Promise((r) => setTimeout(r, 550));

    // Validate 6 digit OTP or backup code
    if (!data.isBackupCode) {
      if (data.code.length !== 6 || !/^\d{6}$/.test(data.code)) {
        throw new Error('Invalid authentication code. Please enter 6 digits.');
      }
    } else {
      if (data.code.trim().length < 8) {
        throw new Error('Invalid backup code. Please enter the full 8-character code.');
      }
    }

    const user = getStoredUser();
    const accessToken = 'bp_jwt_' + Math.random().toString(36).substring(2);
    const refreshToken = 'bp_refresh_' + Math.random().toString(36).substring(2);

    localStorage.setItem('codepulse_access_token', accessToken);
    localStorage.setItem('codepulse_refresh_token', refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  // 4. Token Refresh
  refreshToken: async () => {
    await new Promise((r) => setTimeout(r, 300));
    const token = 'bp_jwt_refreshed_' + Math.random().toString(36).substring(2);
    localStorage.setItem('codepulse_access_token', token);
    return { accessToken: token };
  },

  // 5. Logout
  logout: async () => {
    await new Promise((r) => setTimeout(r, 200));
    localStorage.removeItem('codepulse_access_token');
    localStorage.removeItem('codepulse_refresh_token');
    return { success: true };
  },

  // 6. Forgot Password (constant message to prevent user enumeration)
  forgotPassword: async (email: string) => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      message: "If an account exists for this email, we've sent a password reset link to your inbox.",
    };
  },

  // 7. Reset Password
  resetPassword: async (data: { token: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 600));

    if (!data.token || data.token === 'invalid' || data.token === 'expired') {
      throw new Error('This password reset link has expired or is invalid. Please request a new one.');
    }

    return {
      success: true,
      message: 'Your password has been successfully updated. You can now sign in.',
    };
  },

  // 8. Verify Email
  verifyEmail: async (token: string) => {
    await new Promise((r) => setTimeout(r, 700));

    if (!token || token === 'expired') {
      throw new Error('The email verification link has expired. Please request a new verification link.');
    }

    const user = getStoredUser();
    user.emailVerified = true;
    saveStoredUser(user);

    return {
      success: true,
      message: 'Your email address has been verified successfully.',
      user,
    };
  },

  // 9. Get Current User Profile
  getCurrentUser: async (): Promise<User> => {
    await new Promise((r) => setTimeout(r, 300));
    return getStoredUser();
  },

  // 10. Update Profile (PATCH /api/users/me)
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    await new Promise((r) => setTimeout(r, 500));
    const current = getStoredUser();
    const updated: User = {
      ...current,
      ...updates,
      lastActive: 'Just now',
    };
    saveStoredUser(updated);
    return updated;
  },

  // 11. Upload Avatar (POST /api/users/me/avatar)
  uploadAvatar: async (dataUrlOrFile: string | File): Promise<{ avatarUrl: string }> => {
    await new Promise((r) => setTimeout(r, 700));
    const current = getStoredUser();

    let avatarUrl = '';
    if (typeof dataUrlOrFile === 'string') {
      avatarUrl = dataUrlOrFile;
    } else {
      avatarUrl = URL.createObjectURL(dataUrlOrFile);
    }

    current.avatarUrl = avatarUrl;
    saveStoredUser(current);

    return { avatarUrl };
  },

  // 12. Delete Avatar (DELETE /api/users/me/avatar)
  deleteAvatar: async (): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 400));
    const current = getStoredUser();
    current.avatarUrl = '';
    saveStoredUser(current);
    return { success: true };
  },

  // 13. 2FA Setup (POST /api/auth/2fa/setup)
  setup2FA: async (): Promise<TwoFactorSetupData> => {
    await new Promise((r) => setTimeout(r, 500));
    const secret = 'JBSWY3DPEHPK3PXP';
    // Generate clean QR code data URI or SVG
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/BugPulseAI:alex.rivera@codepulse.ai?secret=${secret}&issuer=BugPulseAI`;
    const backupCodes = generateBackupCodes();

    localStorage.setItem(STORAGE_KEY_2FA_SECRET, secret);
    localStorage.setItem(STORAGE_KEY_BACKUP_CODES, JSON.stringify(backupCodes));

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  },

  // 14. 2FA Enable (POST /api/auth/2fa/enable)
  enable2FA: async (code: string): Promise<{ success: boolean; user: User }> => {
    await new Promise((r) => setTimeout(r, 600));

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code. Please enter 6 numeric digits.');
    }

    const current = getStoredUser();
    current.twoFactorEnabled = true;
    current.backupCodesRemaining = 8;
    saveStoredUser(current);

    return { success: true, user: current };
  },

  // 15. 2FA Disable (POST /api/auth/2fa/disable)
  disable2FA: async (credentials: { password: string; code: string }): Promise<{ success: boolean; user: User }> => {
    await new Promise((r) => setTimeout(r, 600));

    if (!credentials.password) {
      throw new Error('Current password is required to disable two-factor authentication.');
    }
    if (!credentials.code || credentials.code.length !== 6) {
      throw new Error('Valid 6-digit verification code is required.');
    }

    const current = getStoredUser();
    current.twoFactorEnabled = false;
    current.backupCodesRemaining = 0;
    saveStoredUser(current);

    return { success: true, user: current };
  },

  // 16. Regenerate Backup Codes (POST /api/auth/2fa/backup-codes)
  regenerateBackupCodes: async (): Promise<{ backupCodes: string[] }> => {
    await new Promise((r) => setTimeout(r, 500));
    const backupCodes = generateBackupCodes();
    localStorage.setItem(STORAGE_KEY_BACKUP_CODES, JSON.stringify(backupCodes));

    const current = getStoredUser();
    current.backupCodesRemaining = backupCodes.length;
    saveStoredUser(current);

    return { backupCodes };
  },

  // 17. Get Active Sessions (GET /api/users/me/sessions)
  getSessions: async (): Promise<UserSession[]> => {
    await new Promise((r) => setTimeout(r, 350));
    return getStoredSessions();
  },

  // 18. Revoke Session (DELETE /api/users/me/sessions/:id)
  revokeSession: async (sessionId: string): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 400));
    const sessions = getStoredSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    saveStoredSessions(filtered);
    return { success: true };
  },

  // 19. Connect / Disconnect Provider
  toggleProvider: async (provider: 'google' | 'github', connect: boolean): Promise<User> => {
    await new Promise((r) => setTimeout(r, 500));
    const user = getStoredUser();
    const accounts = user.connectedAccounts || [];

    // Rule: block disconnecting the last remaining login method
    const connectedCount = accounts.filter((a) => a.connected).length;
    if (!connect && connectedCount <= 1 && !user.emailVerified) {
      throw new Error('You cannot disconnect your only authenticated sign-in method.');
    }

    const updatedAccounts = accounts.map((acc) => {
      if (acc.provider === provider) {
        return {
          ...acc,
          connected: connect,
          email: connect ? `${user.username}@${provider}.com` : undefined,
          connectedAt: connect ? new Date().toISOString() : undefined,
        };
      }
      return acc;
    });

    user.connectedAccounts = updatedAccounts;
    saveStoredUser(user);
    return user;
  },

  // 20. Delete Account (DELETE /api/users/me)
  deleteAccount: async (confirmEmail: string): Promise<{ success: boolean }> => {
    await new Promise((r) => setTimeout(r, 700));
    const user = getStoredUser();

    if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new Error(`Email does not match '${user.email}'. Account deletion aborted.`);
    }

    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem('codepulse_access_token');
    localStorage.removeItem('codepulse_refresh_token');

    return { success: true };
  },
};
