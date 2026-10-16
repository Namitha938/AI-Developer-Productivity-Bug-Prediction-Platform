import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AvatarUploader } from '../../components/profile/AvatarUploader';
import { SocialLinksForm } from '../../components/profile/SocialLinksForm';
import { ConnectedAccounts } from '../../components/profile/ConnectedAccounts';
import { SessionsList } from '../../components/profile/SessionsList';
import { TwoFactorSetupDialog } from '../../components/auth/TwoFactorSetupDialog';
import { PasswordInput } from '../../components/auth/PasswordInput';
import {
  User,
  Shield,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Save,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Mail,
  Loader2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Check,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    disable2FA,
    deleteAccount,
    logout,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [title, setTitle] = useState(user?.title || '');
  const [company, setCompany] = useState(user?.company || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Dirty state tracking for unsaved changes warning
  const hasUnsavedChanges =
    name !== (user?.name || '') ||
    username !== (user?.username || '') ||
    title !== (user?.title || '') ||
    company !== (user?.company || '') ||
    location !== (user?.location || '') ||
    bio !== (user?.bio || '');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA Dialogs
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [isDisable2FAOpen, setIsDisable2FAOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState<string | null>(null);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Delete Account Dialog
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="p-10 flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading developer profile...</span>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    if (username.length < 3) {
      setProfileErrorMsg('Username must be at least 3 characters.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name,
        username,
        title,
        company,
        location,
        bio,
      });
      setProfileSuccessMsg('Profile updated successfully.');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setProfileErrorMsg(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    // Simulate password change
    await new Promise((r) => setTimeout(r, 600));
    setPasswordSuccess('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError(null);
    setIsDisabling2FA(true);
    try {
      await disable2FA(disablePassword, disableCode);
      setIsDisable2FAOpen(false);
      setDisablePassword('');
      setDisableCode('');
    } catch (err: unknown) {
      setDisableError(err instanceof Error ? err.message : 'Failed to disable 2FA.');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteAccount(confirmDeleteEmail);
      logout();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Admin
        </span>
      );
    }
    if (role === 'tech_lead') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          Tech Lead
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
        Developer
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar Component with Crop Modal */}
          <AvatarUploader
            currentAvatarUrl={user.avatarUrl}
            userName={user.name}
            onSaveAvatar={async (url) => {
              await uploadAvatar(url);
            }}
            onRemoveAvatar={async () => {
              await deleteAvatar();
            }}
          />

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h1>
              {getRoleBadge(user.role)}
              <span className="font-mono text-xs text-slate-400">@{user.username}</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {user.title}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center justify-center md:justify-end gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold self-center md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & 2FA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Active Sessions</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && activeTab === 'profile' && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-4 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You have unsaved changes to your developer profile.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="px-3.5 py-1.5 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            {isSavingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* TAB 1: General Profile & Social Links */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* General Information Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-0.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500">
                Update your public profile details and bio.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Job title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Staff Software Engineer"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="BugPulse Systems"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Bio
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        bio.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {bio.length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief summary of your role, stack, and interests..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile || bio.length > 160}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm"
                >
                  {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Social Links Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <SocialLinksForm
              initialLinks={user.socialLinks}
              onSave={async (links) => {
                await updateProfile({ socialLinks: links });
              }}
            />
          </div>

          {/* Connected Accounts Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <ConnectedAccounts accounts={user.connectedAccounts} />
          </div>
        </div>
      )}

      {/* TAB 2: Security & Two-Factor Authentication */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Change Password Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-0.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
              <p className="text-xs text-slate-500">
                Update your account password. Must be at least 8 characters.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current password
                </label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm new password
                </label>
                <PasswordInput
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm"
              >
                {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Update password</span>
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="text-xs text-slate-500">
                  Protect your developer account with an extra verification layer using TOTP.
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold self-start sm:self-center ${
                  user.twoFactorEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {user.twoFactorEnabled ? '● 2FA Enabled' : '○ Disabled'}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              <p>
                When enabled, BugPulse AI will require a 6-digit one-time code from your authenticator app
                (Google Authenticator, Authy, 1Password) whenever you sign in with credentials.
              </p>

              {user.twoFactorEnabled && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Emergency Backup Codes:
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {user.backupCodesRemaining || 8} remaining
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Keep your backup codes stored safely in case you lose access to your primary device.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!user.twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => setIs2FASetupOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enable 2FA</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIs2FASetupOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    Regenerate backup codes
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDisable2FAOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Disable 2FA
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950 shadow-sm space-y-4">
            <div className="space-y-0.5 pb-2 border-b border-red-100 dark:border-red-950">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-xs text-slate-500">
                Permanently delete your BugPulse AI account, repository scan history, and settings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Once deleted, your account cannot be recovered. All associated pull request annotations and personal analysis records will be permanently removed.
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Active Sessions List */}
      {activeTab === 'sessions' && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <SessionsList />
        </div>
      )}

      {/* TwoFactorSetupDialog Modal */}
      <TwoFactorSetupDialog
        isOpen={is2FASetupOpen}
        onClose={() => setIs2FASetupOpen(false)}
        onSuccess={() => {
          setIs2FASetupOpen(false);
          setProfileSuccessMsg('Two-factor authentication enabled successfully.');
          setTimeout(() => setProfileSuccessMsg(null), 4000);
        }}
      />

      {/* Disable 2FA Confirm Dialog */}
      {isDisable2FAOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Disable 2FA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please enter your current account password and 6-digit authenticator code to confirm disabling two-factor authentication.
            </p>

            {disableError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
                {disableError}
              </div>
            )}

            <form onSubmit={handleDisable2FA} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <PasswordInput
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Your current password"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  6-digit 2FA Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3.5 py-2 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisable2FAOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisabling2FA || !disablePassword || disableCode.length !== 6}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDisabling2FA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Disable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirm Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 shadow-2xl p-6 space-y-4 text-left">
            <h3 className="text-base font-bold text-red-600 dark:text-red-400">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action is permanent and cannot be undone. To proceed, please type your email address{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{user.email}</strong> below:
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <div className="space-y-1">
              <input
                type="text"
                value={confirmDeleteEmail}
                onChange={(e) => setConfirmDeleteEmail(e.target.value)}
                placeholder={user.email}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmDeleteEmail('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || confirmDeleteEmail !== user.email}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
