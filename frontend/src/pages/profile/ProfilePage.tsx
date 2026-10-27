import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LockKeyhole,
  Loader2,
} from 'lucide-react';
import {
  getProfile,
  updateProfile as saveProfileToBackend,
  type ProfileData,
} from '../../api/profileApi';
import {
  getAccountPreferences,
  updateAccountPreferences,
  getConnectedAccounts,
  getSecurityStatus,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
  disableEmailVerification,
  type AccountPreferences,
  type NotificationPreferences,
  type ConnectedAccountsResponse,
  type SecurityStatusResponse,
} from '../../api/accountSettingsApi';
import { ConnectedAccounts } from '@/components/profile/ConnectedAccounts';
import { ChangePassword } from '../../components/settings/ChangePassword';

type ProfileTab = 'profile' | 'security' | 'connected' | 'preferences';

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  email: true,
  in_app: true,
  security_alerts: true,
  weekly_report: false,
};

const RESEND_COOLDOWN_SECONDS = 60;

const inputClass =
  'w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500';

const cardClass =
  'p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4';

const mutedTextClass = 'text-xs text-slate-500 dark:text-slate-400';

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const formatDate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 'Unavailable';
  }

  const date = typeof value === 'number' ? new Date(value) : new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : date.toLocaleString();
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<ProfileTab>(
    location.pathname.includes('/security') ? 'security' : 'profile',
  );

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [emailAddress, setEmailAddress] = useState(user?.email ?? '');
  const [role, setRole] = useState(user?.title ?? '');

  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('English (US)');
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);

  const [savedPreferences, setSavedPreferences] =
    useState<AccountPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState('');

  const [securityStatus, setSecurityStatus] =
    useState<SecurityStatusResponse | null>(null);
  const [connectedAccounts, setConnectedAccounts] =
    useState<ConnectedAccountsResponse | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Email-verification UI state.
  const [verificationCode, setVerificationCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?';

  const loadSecurityData = useCallback(async () => {
    if (!user) {
      setSecurityStatus(null);
      setConnectedAccounts(null);
      setSecurityError('');
      return;
    }

    setSecurityLoading(true);
    setSecurityError('');

    try {
      const [security, accounts] = await Promise.all([
        getSecurityStatus(),
        getConnectedAccounts(),
      ]);

      setSecurityStatus(security);
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Failed to load account security data:', error);
      setSecurityError(
        'Could not load account security information. Check the backend logs and your sign-in session.',
      );
    } finally {
      setSecurityLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setProfileLoading(true);
      setProfileError('');
      setPreferencesLoading(true);
      setPreferencesError('');

      if (!user) {
        setProfileLoading(false);
        setPreferencesLoading(false);
        setProfileError('Sign in to view your profile.');
        return;
      }

      const profileRequest = getProfile()
        .then((data) => {
          if (cancelled) return;

          setProfile(data);
          setFullName(data.full_name || user.name || '');
          setEmailAddress(data.email || user.email || '');
          setRole(data.title || user.title || '');
        })
        .catch((error: unknown) => {
          if (cancelled) return;

          console.error('Failed to load profile:', error);
          setProfileError(
            'Could not load your profile. Check that you are signed in and the backend is running.',
          );
        })
        .finally(() => {
          if (!cancelled) setProfileLoading(false);
        });

      const preferencesRequest = getAccountPreferences()
        .then((data) => {
          if (cancelled) return;

          setSavedPreferences(data);
          setTimezone(data.timezone || 'Asia/Kolkata');
          setLanguage(data.language || 'English (US)');
          setNotifications({
            ...DEFAULT_NOTIFICATIONS,
            ...data.notifications,
          });
        })
        .catch((error: unknown) => {
          if (cancelled) return;

          console.error('Failed to load account preferences:', error);
          setPreferencesError(
            'Could not load saved preferences. Check the account-settings endpoint and try again.',
          );
        })
        .finally(() => {
          if (!cancelled) setPreferencesLoading(false);
        });

      await Promise.all([profileRequest, preferencesRequest]);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.name, user?.email, user?.title]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        setSecurityStatus(null);
        setConnectedAccounts(null);
        setSecurityError('');
        setSecurityLoading(false);
        return;
      }

      setSecurityLoading(true);
      setSecurityError('');

      try {
        const [security, accounts] = await Promise.all([
          getSecurityStatus(),
          getConnectedAccounts(),
        ]);

        if (cancelled) return;

        setSecurityStatus(security);
        setConnectedAccounts(accounts);
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to load security settings:', error);
        setSecurityError(
          'Could not load account security information. Check the backend endpoints and your Firebase session.',
        );
      } finally {
        if (!cancelled) setSecurityLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timeout = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendSeconds]);

  const handleRequestCode = async () => {
    setVerificationError('');
    setVerificationMessage('');
    setVerificationBusy(true);

    try {
      const response = await sendEmailVerificationCode();

      setCodeRequested(true);
      setVerificationCode('');
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setVerificationMessage(
        response.message || 'A verification code has been sent to your email.',
      );
    } catch (error: any) {
      console.error('Failed to send email verification code:', error);

      const detail = error?.response?.data?.detail;
      setVerificationError(
        typeof detail === 'string'
          ? detail
          : 'Could not send the verification code. Please try again later.',
      );
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(verificationCode)) {
      setVerificationError('Enter the six-digit code from your email.');
      return;
    }

    setVerificationBusy(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const response = await verifyEmailVerificationCode(verificationCode);

      setVerificationMessage(
        response.message || 'Email verification setting enabled.',
      );
      setVerificationCode('');
      setCodeRequested(false);
      setResendSeconds(0);

      await loadSecurityData();
    } catch (error: any) {
      console.error('Failed to verify email code:', error);

      const detail = error?.response?.data?.detail;
      setVerificationError(
        typeof detail === 'string'
          ? detail
          : 'The code could not be verified. Check the code and try again.',
      );
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleDisableEmailVerification = async () => {
    const confirmed = window.confirm(
      'Disable the email-verification setting for your account?',
    );

    if (!confirmed) return;

    setVerificationBusy(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const response = await disableEmailVerification();

      setVerificationMessage(
        response.message || 'Email-verification setting disabled.',
      );
      setCodeRequested(false);
      setVerificationCode('');
      setResendSeconds(0);

      await loadSecurityData();
    } catch (error: any) {
      console.error('Failed to disable email verification:', error);

      const detail = error?.response?.data?.detail;
      setVerificationError(
        typeof detail === 'string'
          ? detail
          : 'Could not disable the email-verification setting.',
      );
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError('');
    setPreferencesError('');
    setSavedSuccess(false);

    if (!user) {
      setSaveError('You must be signed in to save changes.');
      return;
    }

    setIsSaving(true);

    try {
      if (activeTab === 'preferences') {
        const updated = await updateAccountPreferences({
          timezone,
          language,
          notifications,
        });

        setSavedPreferences(updated);
        setTimezone(updated.timezone);
        setLanguage(updated.language);
        setNotifications({
          ...DEFAULT_NOTIFICATIONS,
          ...updated.notifications,
        });
        setSavedSuccess(true);
        return;
      }

      if (!fullName.trim()) {
        setSaveError('Full name cannot be empty.');
        return;
      }

      const updated = await saveProfileToBackend({
        full_name: fullName.trim(),
        title: role.trim(),
        timezone,
        language,
      });

      await updateProfile({ name: fullName.trim() });

      setProfile(updated);
      setFullName(updated.full_name || fullName.trim());
      setEmailAddress(updated.email || emailAddress);
      setRole(updated.title || '');
      setSavedSuccess(true);
    } catch (error) {
      console.error('Failed to save settings:', error);

      setSaveError(
        activeTab === 'preferences'
          ? 'Could not save preferences. Check your connection and backend logs, then try again.'
          : 'Could not save your profile. Check your connection and backend logs, then try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError('');
    setPreferencesError('');
    setSavedSuccess(false);

    if (activeTab === 'preferences') {
      setTimezone(savedPreferences?.timezone || 'Asia/Kolkata');
      setLanguage(savedPreferences?.language || 'English (US)');
      setNotifications({
        ...DEFAULT_NOTIFICATIONS,
        ...(savedPreferences?.notifications || {}),
      });
      return;
    }

    setFullName(profile?.full_name || user?.name || '');
    setEmailAddress(profile?.email || user?.email || '');
    setRole(profile?.title || user?.title || '');
  };

  const statusPill = (label: string) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
      {label}
    </span>
  );

  const notImplementedNotice = (
    <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
        This feature is not available yet. No unsupported security or session
        action has been performed.
      </p>
    </div>
  );

  const emailVerificationEnabled =
    securityStatus?.email_verification_enabled ?? false;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile details, preferences, and account security.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-5 sm:gap-6 text-xs font-semibold flex-wrap">
          {(
            [
              ['profile', 'Profile'],
              ['security', 'Security'],
              ['connected', 'Connected accounts'],
              ['preferences', 'Preferences'],
            ] as [ProfileTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setSaveError('');
                setPreferencesError('');
                setSavedSuccess(false);
              }}
              className={`pb-3 border-b-2 cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 pb-3">
          <span>
            Active section:{' '}
            <strong className="text-slate-700 dark:text-slate-200 capitalize">
              {activeTab}
            </strong>
          </span>
          {profile?.updated_at && (
            <span className="ml-3">
              Updated {formatDate(profile.updated_at)}
            </span>
          )}
        </div>
      </div>

      {profileLoading ? (
        <div className={`${cardClass} items-center py-12`}>
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className={mutedTextClass}>Loading your profile…</p>
        </div>
      ) : profileError ? (
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Profile unavailable
              </h2>
              <p className={mutedTextClass}>{profileError}</p>
              {user && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={primaryButtonClass}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'profile' || activeTab === 'preferences' ? (
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'profile' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <div className={cardClass}>
                  <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white">
                      Profile summary
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Account details
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                          {fullName || 'Your name'}
                        </h3>
                        <p className="text-xs text-slate-500 break-all">
                          {emailAddress || 'No email available'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {role || 'No role specified'}
                        </p>
                      </div>
                    </div>

                    {user?.emailVerified && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                        Email verified
                      </span>
                    )}
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white">
                      Personal information
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Editable details
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="profile-full-name" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Full name
                      </label>
                      <input
                        id="profile-full-name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        required
                        value={fullName}
                        onChange={(event) => {
                          setFullName(event.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="profile-email" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Email address
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        autoComplete="email"
                        value={emailAddress}
                        readOnly
                        className={`${inputClass} opacity-70 cursor-not-allowed`}
                      />
                      <p className="text-[10px] text-slate-400">
                        Email changes require a separate Firebase verification flow.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="profile-role" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Role
                      </label>
                      <input
                        id="profile-role"
                        type="text"
                        maxLength={120}
                        value={role}
                        onChange={(event) => {
                          setRole(event.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className={cardClass}>
                  <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                    Account information
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Username</span>
                      <span className="text-xs text-slate-900 dark:text-white break-all">
                        {profile?.username || user?.username || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Email verification</span>
                      <span className="text-xs text-slate-900 dark:text-white">
                        {user?.emailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Account ID</span>
                      <span className="text-[10px] text-slate-500 break-all text-right max-w-[65%]">
                        {user?.id || 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                    Account security
                  </div>
                  <p className={mutedTextClass}>
                    Review your password recovery options and account security status.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Review security settings
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <div className={cardClass}>
                <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                  Regional preferences
                </div>

                <div className="space-y-1">
                  <label htmlFor="profile-timezone" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Timezone
                  </label>
                  <select
                    id="profile-timezone"
                    value={timezone}
                    onChange={(event) => {
                      setTimezone(event.target.value);
                      setSavedSuccess(false);
                    }}
                    className={inputClass}
                    disabled={preferencesLoading}
                  >
                    <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
                    <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                    <option value="America/New_York">Eastern Time (America/New_York)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="profile-language" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Language
                  </label>
                  <select
                    id="profile-language"
                    value={language}
                    onChange={(event) => {
                      setLanguage(event.target.value);
                      setSavedSuccess(false);
                    }}
                    className={inputClass}
                    disabled={preferencesLoading}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Language is saved as a preference; full application translation is not implemented yet.
                  </p>
                </div>
              </div>

              <div className={cardClass}>
                <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                  Notifications
                </div>

                {preferencesLoading ? (
                  <p className={mutedTextClass}>Loading notification preferences…</p>
                ) : (
                  <div className="space-y-4">
                    {(
                      [
                        ['email', 'Email notifications', 'Receive updates by email.'],
                        ['in_app', 'In-app notifications', 'Show notifications inside BugPulse AI.'],
                        ['security_alerts', 'Security alerts', 'Receive important account-security notifications.'],
                        ['weekly_report', 'Weekly report', 'Receive a weekly developer productivity summary.'],
                      ] as const
                    ).map(([key, label, description]) => (
                      <label key={key} className="flex items-start justify-between gap-4 cursor-pointer">
                        <span className="space-y-1">
                          <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400">{description}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={(event) => {
                            setNotifications((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }));
                            setSavedSuccess(false);
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {preferencesError && (
                <div role="alert" className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{preferencesError}</span>
                </div>
              )}
            </div>
          )}

          {saveError && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div aria-live="polite" className="text-xs text-slate-500">
              {savedSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Changes saved successfully.
                </span>
              ) : (
                activeTab === 'preferences'
                  ? 'Save your preferences to update your account settings.'
                  : 'Save your changes to update your account profile.'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving || profileLoading || (activeTab === 'preferences' && preferencesLoading)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || profileLoading || (activeTab === 'preferences' && preferencesLoading)}
                className={primaryButtonClass}
              >
                {isSaving ? 'Saving…' : activeTab === 'preferences' ? 'Save preferences' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      ) : activeTab === 'connected' ? (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-900 dark:text-white">Connected accounts</span>
            <button
              type="button"
              onClick={() => void loadSecurityData()}
              disabled={securityLoading}
              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${securityLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {securityError && (
            <div role="alert" className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs">
              {securityError}
            </div>
          )}

          {securityLoading && !connectedAccounts ? (
            <p className={mutedTextClass}>Loading connected accounts…</p>
          ) : connectedAccounts ? (
            <>
              <p className={mutedTextClass}>
                Provider information is loaded from your authenticated backend. Linking and unlinking actions use Firebase Authentication.
              </p>
              <ConnectedAccounts />
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Backend-reported providers:{' '}
                {connectedAccounts.providers.length
                  ? connectedAccounts.providers.map((provider) => provider.provider_id).join(', ')
                  : 'None reported'}
              </div>
            </>
          ) : (
            <p className={mutedTextClass}>
              Connected-account information is unavailable. Use Refresh to retry.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {securityError && (
            <div role="alert" className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs">
              {securityError}
            </div>
          )}

          {securityLoading && !securityStatus ? (
            <div className={cardClass}>
              <p className={mutedTextClass}>Loading account security…</p>
            </div>
          ) : securityStatus ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <div className={cardClass}>
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-900 dark:text-white">
                        Password management
                      </span>
                      {statusPill('Firebase authentication')}
                    </div>

                    <p className={mutedTextClass}>
                      Change your password while signed in, or request a secure password-reset link if you have forgotten it.
                    </p>

                    <ChangePassword />

                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Forgot your password? Reset by email
                      </Link>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-900 dark:text-white">Verified account status</span>
                      {securityStatus.email_verified ? (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                      ) : statusPill('Not verified')}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Account email</span>
                      <span className="text-xs text-slate-900 dark:text-white break-all">{securityStatus.email || 'Unavailable'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Account created</span>
                      <span className="text-xs text-slate-900 dark:text-white">{formatDate(securityStatus.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Last sign-in</span>
                      <span className="text-xs text-slate-900 dark:text-white">{formatDate(securityStatus.last_sign_in_at)}</span>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-900 dark:text-white">Linked sign-in providers</span>
                      {statusPill(`${securityStatus.providers.length} provider(s)`)}
                    </div>
                    {securityStatus.providers.length ? (
                      <div className="space-y-3">
                        {securityStatus.providers.map((provider) => (
                          <div key={`${provider.provider_id}:${provider.uid}`} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold">
                              {provider.provider_id === 'google.com'
                                ? 'G'
                                : provider.provider_id === 'github.com'
                                  ? 'GH'
                                  : provider.provider_id.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{provider.provider_id}</p>
                              <p className={mutedTextClass}>{provider.email || provider.display_name || 'No provider email available'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={mutedTextClass}>No linked providers were returned by the backend.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* This is the email-verification setting, not Firebase MFA. */}
                  <div className={cardClass}>
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Email verification
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          emailVerificationEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                        }`}
                      >
                        {emailVerificationEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <p className={mutedTextClass}>
                      Confirm control of your verified email address with a short-lived code. This setting is saved to your account.
                    </p>

                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20">
                      <LockKeyhole className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                        This setting does not yet require a second code during sign-in, so it is not login-enforced two-factor authentication.
                      </p>
                    </div>

                    {verificationError && (
                      <div role="alert" className="flex items-start gap-2 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{verificationError}</span>
                      </div>
                    )}

                    {verificationMessage && (
                      <div role="status" aria-live="polite" className="flex items-start gap-2 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{verificationMessage}</span>
                      </div>
                    )}

                    {!securityStatus.email_verified ? (
                      <div className="space-y-3">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Verify your email address with Firebase before enabling this setting.
                        </p>
                        <button type="button" disabled className={secondaryButtonClass}>
                          <Mail className="w-3.5 h-3.5" />
                          Email verification required
                        </button>
                      </div>
                    ) : emailVerificationEnabled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          The email-verification setting is active.
                        </div>

                        {securityStatus.email_verification_enabled_at && (
                          <p className={mutedTextClass}>
                            Enabled on {formatDate(securityStatus.email_verification_enabled_at)}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleDisableEmailVerification()}
                          disabled={verificationBusy}
                          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50"
                        >
                          {verificationBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Disable email verification
                        </button>
                      </div>
                    ) : !codeRequested ? (
                      <div className="space-y-3">
                        <p className={mutedTextClass}>
                          A six-digit code will be sent to {securityStatus.email || 'your verified email address'}.
                        </p>

                        <button
                          type="button"
                          onClick={() => void handleRequestCode()}
                          disabled={verificationBusy || securityLoading}
                          className={primaryButtonClass}
                        >
                          {verificationBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          {verificationBusy ? 'Sending code…' : 'Send verification code'}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleVerifyCode} className="space-y-3">
                        <div className="space-y-1">
                          <label htmlFor="email-verification-code" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                            Six-digit verification code
                          </label>
                          <input
                            id="email-verification-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            minLength={6}
                            required
                            value={verificationCode}
                            onChange={(event) => {
                              setVerificationCode(
                                event.target.value.replace(/\D/g, '').slice(0, 6),
                              );
                              setVerificationError('');
                            }}
                            placeholder="Enter 6-digit code"
                            className={`${inputClass} text-center tracking-[0.35em] font-mono text-base`}
                            disabled={verificationBusy}
                          />
                          <p className={mutedTextClass}>
                            Check your inbox and spam folder. Codes expire after 10 minutes.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={verificationBusy || verificationCode.length !== 6}
                          className={primaryButtonClass}
                        >
                          {verificationBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {verificationBusy ? 'Verifying…' : 'Verify code and enable'}
                        </button>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void handleRequestCode()}
                            disabled={verificationBusy || resendSeconds > 0}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400 disabled:no-underline"
                          >
                            {resendSeconds > 0
                              ? `Resend available in ${resendSeconds}s`
                              : 'Resend code'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCodeRequested(false);
                              setVerificationCode('');
                              setVerificationError('');
                              setVerificationMessage('');
                            }}
                            disabled={verificationBusy}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>


                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void loadSecurityData()}
                  disabled={securityLoading || verificationBusy}
                  className={secondaryButtonClass}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${securityLoading ? 'animate-spin' : ''}`} />
                  Refresh security status
                </button>
              </div>
            </>
          ) : (
            <div className={cardClass}>
              <p className={mutedTextClass}>Security information is unavailable.</p>
              <button
                type="button"
                onClick={() => void loadSecurityData()}
                className={primaryButtonClass}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
