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
  Building,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  User as UserIcon,
  FileText,
  KeyRound,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import {
  getProfile,
  updateProfile as saveProfileToBackend,
  uploadAvatar,
  deleteAvatar,
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
import { TotpMfaSettings } from '../../components/settings/TotpMfaSettings';

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

  // Profile Fields
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [emailAddress, setEmailAddress] = useState(user?.email ?? '');
  const [role, setRole] = useState(user?.title ?? '');
  const [company, setCompany] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Social Links
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  // Preferences
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('English (US)');
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);

  const [savedPreferences, setSavedPreferences] =
    useState<AccountPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesError, setPreferencesError] = useState('');

  // Security Status
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

  const initials = (fullName || user?.name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  const statusPill = (label: string) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {label}
    </span>
  );

  const loadSecurityData = useCallback(async () => {
    if (!user?.id) {
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
          setCompany(data.company || '');
          setUserLocation(data.location || '');
          setBio(data.bio || '');
          setGithub(data.social_links?.github || '');
          setLinkedin(data.social_links?.linkedin || '');
          setTwitter(data.social_links?.twitter || '');
          setWebsite(data.social_links?.website || '');
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
            'Could not load saved preferences. Falling back to platform defaults.',
          );
        })
        .finally(() => {
          if (!cancelled) setPreferencesLoading(false);
        });

      await Promise.allSettled([profileRequest, preferencesRequest]);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (activeTab === 'security' || activeTab === 'connected') {
      void loadSecurityData();
    }
  }, [activeTab, loadSecurityData]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleRequestCode = async () => {
    setVerificationBusy(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const response = await sendEmailVerificationCode();
      setCodeRequested(true);
      setVerificationCode('');
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setVerificationMessage(
        response.message ||
          'Verification code sent. Check your email inbox and spam folder.',
      );
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      const detail = error?.response?.data?.detail;
      setVerificationError(
        typeof detail === 'string'
          ? detail
          : 'Could not send verification code. Try again later.',
      );
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerificationBusy(true);
    setVerificationError('');
    setVerificationMessage('');

    const trimmed = verificationCode.trim();

    if (trimmed.length !== 6) {
      setVerificationError('Enter the complete six-digit verification code.');
      setVerificationBusy(false);
      return;
    }

    try {
      const response = await verifyEmailVerificationCode(trimmed);
      setVerificationMessage(
        response.message ||
          'Email verification confirmed. Setting is now enabled.',
      );
      setVerificationCode('');
      setCodeRequested(false);
      setResendSeconds(0);
      await loadSecurityData();
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      const detail = error?.response?.data?.detail;
      setVerificationError(
        typeof detail === 'string'
          ? detail
          : 'Invalid or expired code. Please request a new one.',
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Profile picture must be under 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');

    try {
      const res = await uploadAvatar(file);
      setAvatarUrl(res.avatar_url);
      setAvatarSuccess('Profile photo updated successfully!');
      if (user) {
        useAuthStore.setState({ user: { ...user, avatarUrl: res.avatar_url } });
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      const detail = err?.response?.data?.detail || 'Failed to upload photo.';
      setAvatarError(detail);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');

    try {
      await deleteAvatar();
      setAvatarUrl('');
      setAvatarSuccess('Profile photo removed.');
      if (user) {
        useAuthStore.setState({ user: { ...user, avatarUrl: '' } });
      }
    } catch (err: any) {
      setAvatarError('Failed to remove photo.');
    } finally {
      setUploadingAvatar(false);
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
        company: company.trim(),
        location: userLocation.trim(),
        bio: bio.trim(),
        timezone,
        language,
        social_links: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim(),
          website: website.trim(),
        },
      });

      await updateProfile({
        name: fullName.trim(),
      });

      setProfile(updated);
      setFullName(updated.full_name || fullName.trim());
      setEmailAddress(updated.email || emailAddress);
      setRole(updated.title || '');
      setCompany(updated.company || '');
      setUserLocation(updated.location || '');
      setBio(updated.bio || '');
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
      if (savedPreferences) {
        setTimezone(savedPreferences.timezone);
        setLanguage(savedPreferences.language);
        setNotifications({
          ...DEFAULT_NOTIFICATIONS,
          ...savedPreferences.notifications,
        });
      }
      return;
    }

    if (profile) {
      setFullName(profile.full_name || user?.name || '');
      setEmailAddress(profile.email || user?.email || '');
      setRole(profile.title || user?.title || '');
      setCompany(profile.company || '');
      setUserLocation(profile.location || '');
      setBio(profile.bio || '');
      setGithub(profile.social_links?.github || '');
      setLinkedin(profile.social_links?.linkedin || '');
      setTwitter(profile.social_links?.twitter || '');
      setWebsite(profile.social_links?.website || '');
      setAvatarUrl(user?.avatarUrl || '');
    }
  };

  const emailVerificationEnabled = Boolean(
    securityStatus?.email_verification_enabled,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Account Settings & Security
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal developer profile, two-factor authentication, and account preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                securityStatus?.two_factor_enabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              2FA: {securityStatus?.two_factor_enabled ? 'Active' : 'Not Configured'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {(
            [
              ['profile', 'Profile'],
              ['security', 'Security & 2FA'],
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

        <div className="text-[11px] text-slate-400 pt-3 flex items-center justify-between">
          <span>
            Active section:{' '}
            <strong className="text-slate-700 dark:text-slate-200 capitalize">
              {activeTab === 'security' ? 'Security & 2FA' : activeTab}
            </strong>
          </span>
          {profile?.updated_at && (
            <span>
              Last updated: {formatDate(profile.updated_at)}
            </span>
          )}
        </div>
      </div>

      {profileLoading && activeTab === 'profile' ? (
        <div className={`${cardClass} items-center py-12 text-center`}>
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <p className={mutedTextClass}>Loading your profile…</p>
        </div>
      ) : profileError && activeTab === 'profile' ? (
        <div className={cardClass}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Profile temporarily unavailable
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
              {/* Left Column: Personal Information & Bio */}
              <div className="space-y-6">
                {/* Profile Summary Card */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white">
                      Profile Overview
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Public Identity
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl border-2 border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                          {initials}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        title="Upload photo"
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white break-words">
                            {fullName || 'Your Name'}
                          </h3>
                          <p className="text-xs text-slate-500 break-all font-mono">
                            {emailAddress || 'No email registered'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {uploadingAvatar ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            {uploadingAvatar ? 'Uploading…' : 'Upload Photo'}
                          </button>

                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              disabled={uploadingAvatar}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {role || 'Developer'}
                        </span>
                        {user?.emailVerified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Verified
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          JPG, PNG, or WebP up to 5 MB
                        </span>
                      </div>

                      {avatarSuccess && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{avatarSuccess}</span>
                        </div>
                      )}

                      {avatarError && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{avatarError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className={cardClass}>
                  <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white">
                      Personal Details
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Editable Details
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="profile-full-name" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Full Name *
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
                      <label htmlFor="profile-role" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Professional Title / Role
                      </label>
                      <input
                        id="profile-role"
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        maxLength={120}
                        value={role}
                        onChange={(event) => {
                          setRole(event.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="profile-company" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Company / Organization
                        </label>
                        <div className="relative">
                          <input
                            id="profile-company"
                            type="text"
                            placeholder="Acme Corp"
                            maxLength={150}
                            value={company}
                            onChange={(event) => {
                              setCompany(event.target.value);
                              setSavedSuccess(false);
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="profile-location" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                          Location
                        </label>
                        <div className="relative">
                          <input
                            id="profile-location"
                            type="text"
                            placeholder="San Francisco, CA"
                            maxLength={150}
                            value={userLocation}
                            onChange={(event) => {
                              setUserLocation(event.target.value);
                              setSavedSuccess(false);
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="profile-bio" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Bio / About Developer
                      </label>
                      <textarea
                        id="profile-bio"
                        rows={3}
                        maxLength={1000}
                        placeholder="Tell colleagues about your experience, expertise, and coding interests..."
                        value={bio}
                        onChange={(event) => {
                          setBio(event.target.value);
                          setSavedSuccess(false);
                        }}
                        className={`${inputClass} resize-none`}
                      />
                      <span className="text-[10px] text-slate-400 block text-right">
                        {bio.length}/1000 characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Social Links & Account Info */}
              <div className="space-y-6">
                {/* Social & Developer Links */}
                <div className={cardClass}>
                  <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                    Social & Developer Profiles
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </label>
                      <input
                        type="text"
                        placeholder="username or profile link"
                        value={github}
                        onChange={(e) => {
                          setGithub(e.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Linkedin className="w-3.5 h-3.5" />
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => {
                          setLinkedin(e.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Twitter className="w-3.5 h-3.5" />
                        Twitter / X
                      </label>
                      <input
                        type="text"
                        placeholder="@username"
                        value={twitter}
                        onChange={(e) => {
                          setTwitter(e.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Globe className="w-3.5 h-3.5" />
                        Personal Portfolio / Website
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.dev"
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value);
                          setSavedSuccess(false);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Details & Security Shortcut */}
                <div className={cardClass}>
                  <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                    Account Security & 2FA Status
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Account Email</span>
                      <span className="text-xs text-slate-900 dark:text-white break-all font-mono">
                        {emailAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className={mutedTextClass}>Two-Factor Authentication</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          securityStatus?.two_factor_enabled
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {securityStatus?.two_factor_enabled ? 'Enrolled' : 'Not Configured'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Configure 2FA & Security Credentials
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <div className={cardClass}>
                <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                  Regional Preferences
                </div>

                <div className="space-y-3">
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
                      <option value="Europe/London">London (GMT / BST)</option>
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
                  </div>
                </div>
              </div>

              <div className={cardClass}>
                <div className="text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                  Notification Settings
                </div>

                {preferencesLoading ? (
                  <p className={mutedTextClass}>Loading notification preferences…</p>
                ) : (
                  <div className="space-y-4">
                    {(
                      [
                        ['email', 'Email Notifications', 'Receive sprint reports, bug intercept digests, and issue updates.'],
                        ['in_app', 'In-App Alerts', 'Show popup notifications inside BugPulse AI.'],
                        ['security_alerts', 'Security Alerts', 'Receive critical alerts for login attempts and 2FA changes.'],
                        ['weekly_report', 'Weekly Productivity Summary', 'Receive automated developer velocity summaries.'],
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
                  ? 'Save your preferences to update your regional and notification settings.'
                  : 'Save your profile changes to update your developer identity.'
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving || profileLoading}
                className={secondaryButtonClass}
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={isSaving || profileLoading || (activeTab === 'preferences' && preferencesLoading)}
                className={primaryButtonClass}
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Saving…' : activeTab === 'preferences' ? 'Save preferences' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      ) : activeTab === 'connected' ? (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-900 dark:text-white">Connected Accounts</span>
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
                Link external OAuth providers to sign into BugPulse AI with one click.
              </p>
              <ConnectedAccounts />
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Connected OAuth Providers:{' '}
                {connectedAccounts.providers.length
                  ? connectedAccounts.providers.map((provider) => provider.provider_id).join(', ')
                  : 'None currently linked'}
              </div>
            </>
          ) : (
            <p className={mutedTextClass}>
              Connected-account information is unavailable. Use Refresh to retry.
            </p>
          )}
        </div>
      ) : (
        /* Security & 2FA Tab */
        <div className="space-y-6">
          {securityError && (
            <div role="alert" className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs">
              {securityError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Column 1: Two-Factor Authentication (TOTP App) & Password Management */}
            <div className="space-y-6">
              {/* TOTP 2FA Section */}
              <TotpMfaSettings />

              {/* Password Management */}
              <div className={cardClass}>
                <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">
                    Password Management
                  </span>
                  {statusPill('Firebase Auth')}
                </div>

                <p className={mutedTextClass}>
                  Change your password or request an email password-reset link.
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
            </div>

            {/* Column 2: Email Verification & Security Info */}
            <div className="space-y-6">
              {/* Email Verification Card */}
              <div className={cardClass}>
                <div className="flex items-center justify-between gap-3 text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Email Verification Service
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
                  Verify control of your email address with short-lived security codes sent directly to your inbox.
                </p>

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

                {!securityStatus?.email_verified ? (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Verify your email address before enabling this setting.
                    </p>
                    <button type="button" disabled className={secondaryButtonClass}>
                      <Mail className="w-3.5 h-3.5" />
                      Email Verification Required
                    </button>
                  </div>
                ) : emailVerificationEnabled ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      Email security verification is active.
                    </div>

                    {securityStatus?.email_verification_enabled_at && (
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
                      Disable Email Verification
                    </button>
                  </div>
                ) : !codeRequested ? (
                  <div className="space-y-3">
                    <p className={mutedTextClass}>
                      A six-digit code will be dispatched to {securityStatus?.email || 'your account email'}.
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
                      {verificationBusy ? 'Sending code…' : 'Send Verification Code'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="email-verification-code" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                        Six-Digit Verification Code
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
                        placeholder="000000"
                        className={`${inputClass} text-center tracking-[0.35em] font-mono text-base`}
                        disabled={verificationBusy}
                      />
                      <p className={mutedTextClass}>
                        Check your inbox and spam folder. Codes expire in 10 minutes.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={verificationBusy || verificationCode.length !== 6}
                      className={primaryButtonClass}
                    >
                      {verificationBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {verificationBusy ? 'Verifying…' : 'Confirm Code & Enable'}
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

              {/* Account Security Information Card */}
              <div className={cardClass}>
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Account Security Details</span>
                  {securityStatus?.email_verified ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Verified Account</span>
                  ) : statusPill('Unverified')}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={mutedTextClass}>Account Email</span>
                  <span className="text-xs text-slate-900 dark:text-white break-all">{securityStatus?.email || emailAddress}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={mutedTextClass}>Account Created</span>
                  <span className="text-xs text-slate-900 dark:text-white">{formatDate(securityStatus?.created_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={mutedTextClass}>Last Sign-in</span>
                  <span className="text-xs text-slate-900 dark:text-white">{formatDate(securityStatus?.last_sign_in_at)}</span>
                </div>
              </div>

              {/* Linked Sign-in Providers Card */}
              <div className={cardClass}>
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Linked Authentication Providers</span>
                  {statusPill(`${securityStatus?.providers?.length || 1} provider(s)`)}
                </div>
                {securityStatus?.providers?.length ? (
                  <div className="space-y-3">
                    {securityStatus.providers.map((provider) => (
                      <div key={`${provider.provider_id}:${provider.uid}`} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold">
                          {provider.provider_id === 'google.com'
                            ? 'G'
                            : provider.provider_id === 'github.com'
                              ? 'GH'
                              : provider.provider_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{provider.provider_id}</p>
                          <p className={mutedTextClass}>{provider.email || provider.display_name || 'No provider email'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={mutedTextClass}>Password authentication active.</p>
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
              Refresh Security Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
