import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { TwoFactorSetupDialog } from '../../components/auth/TwoFactorSetupDialog';
import {
  ShieldAlert,
  KeyRound,
  Check,
  Laptop,
  Smartphone,
  Monitor,
  ExternalLink,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'connected' | 'preferences'>(
    location.pathname.includes('/security') ? 'security' : 'profile'
  );

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || 'Maya Chen');
  const [emailAddress, setEmailAddress] = useState(user?.email || 'maya@acme.dev');
  const [role, setRole] = useState(user?.title || 'Frontend developer');
  const [timezone, setTimezone] = useState('UTC-08:00 Pacific Time');
  const [language, setLanguage] = useState('English (US)');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MC';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: fullName,
        title: role,
        email: emailAddress,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Update your profile details, timezone, language, and connected sign-in accounts.
        </p>
      </div>

      {/* 2. Tab Navigation & State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('connected')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'connected'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Connected accounts
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Preferences
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 pb-3">
          <span>Active state: <strong className="text-slate-700 dark:text-slate-200 capitalize">{activeTab}</strong></span>
          <span>Last updated 2 hours ago</span>
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'profile' || activeTab === 'preferences' ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Profile summary</span>
                  <span className="text-[11px] text-slate-400 font-normal">Personal details</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {emailAddress} · {role}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Acme Engineering workspace
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Acme Engineering
                  </span>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Personal information</span>
                  <span className="text-[11px] text-slate-400 font-normal">Editable details</span>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Developer Preferences Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Developer preferences</span>
                  <span className="text-[11px] text-slate-400 font-normal">Timezone and language</span>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="UTC-08:00 Pacific Time">UTC-08:00 Pacific Time</option>
                      <option value="UTC-05:00 Eastern Time">UTC-05:00 Eastern Time</option>
                      <option value="UTC+00:00 UTC">UTC+00:00 UTC</option>
                      <option value="UTC+05:30 India Standard Time">UTC+05:30 India Standard Time</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    These preferences control timezone-aware timestamps and localized alerts.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Connected Accounts Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Connected accounts</span>
                  <span className="text-[11px] text-slate-400 font-normal">2 connected</span>
                </div>

                <div className="space-y-3.5">
                  {/* Google */}
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        G
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          Google authentication
                        </div>
                        <div className="text-[11px] text-slate-500">
                          maya.chen@acme.dev
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Google authentication is enabled for this account.
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      Connected
                    </span>
                  </div>

                  {/* GitHub */}
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ⌥
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          GitHub
                        </div>
                        <div className="text-[11px] text-slate-500">
                          mayachen-dev
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          GitHub is connected for profile completion and identity verification.
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      Connected
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    Connected accounts are used for sign-in, profile completion, and identity verification.
                  </p>
                </div>
              </div>

              {/* Two-Factor Authentication Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Two factor authentication</span>
                  <span className="text-[11px] text-rose-500 font-normal">Not enabled</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                      Two-factor authentication is not enabled. Set it up to add an extra layer of protection.
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Recovery codes will be available after you enable two-factor authentication.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIs2FASetupOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Set up 2FA
                    </button>
                    <button
                      type="button"
                      onClick={() => setIs2FASetupOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Recovery codes
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Recovery Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Password recovery</span>
                  <span className="text-[11px] text-slate-400 font-normal">Last changed 14 days ago</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Password recovery is available for this account. Use the link below if you need to reset access.
                    </p>
                  </div>

                  <div>
                    <Link
                      to="/forgot-password"
                      className="inline-flex px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Forgot password
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500">
              {savedSuccess ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved successfully!
                </span>
              ) : (
                'Changes are saved to your account profile and apply immediately.'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFullName(user?.name || 'Maya Chen');
                  setRole(user?.title || 'Frontend developer');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Security View (Screenshot 5) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Password & Linked */}
            <div className="space-y-6">
              {/* Password management */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Password management</span>
                  <span className="text-[11px] text-slate-400 font-normal">Tracepoint account</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Password</div>
                      <div className="text-[11px] text-slate-400">Last changed 14 days ago. Use a unique password.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/reset-password')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Change password
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Forgot password</div>
                      <div className="text-[11px] text-slate-400">Send a secure reset link to your primary email address.</div>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Send reset link
                    </Link>
                  </div>
                </div>
              </div>

              {/* Linked Accounts */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Linked accounts</span>
                  <span className="text-[11px] text-slate-400 font-normal">Sign-in methods</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">
                        G
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Google</div>
                        <div className="text-[11px] text-slate-400">maya@acme.dev · Linked on Oct 12, 2025</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      Linked
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Linked sign-in accounts are separate from GitHub repository access. Use them to authenticate to your Tracepoint workspace without entering a password.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: 2FA & Recovery Methods */}
            <div className="space-y-6">
              {/* 2FA Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Two-factor authentication</span>
                  <span className="text-[11px] text-rose-500 font-normal">Not enabled</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Not enabled</div>
                      <div className="text-[11px] text-slate-400">Add a second verification step to protect your account.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIs2FASetupOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Set up 2FA
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    Enrollment and verification are handled in separate flows. This screen remains in the not-yet-enabled state for consistency with the static sample frontend.
                  </p>
                </div>
              </div>

              {/* Recovery Methods */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white">Recovery methods</span>
                  <span className="text-[11px] text-slate-400 font-normal">2 configured</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">maya@acme.dev</div>
                        <div className="text-[10px] text-slate-400">Primary email address · Recovery notifications</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                      Primary
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">+1 (415) 555-0182</div>
                        <div className="text-[10px] text-slate-400">SMS recovery · Backup verification path</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Backup
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions Table */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white">Active sessions</span>
              <span className="text-[11px] text-slate-400 font-normal">3 devices</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2 font-medium">DEVICE</th>
                    <th className="py-2 font-medium">LOCATION</th>
                    <th className="py-2 font-medium">LAST ACTIVE</th>
                    <th className="py-2 font-medium">STATUS</th>
                    <th className="py-2 font-medium">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      MacBook Pro · Chrome
                    </td>
                    <td className="py-3 text-slate-500">San Francisco</td>
                    <td className="py-3 text-slate-500">Today, 09:42</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                        Current
                      </span>
                    </td>
                    <td className="py-3 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Manage</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      iPhone 15 · Safari
                    </td>
                    <td className="py-3 text-slate-500">San Francisco</td>
                    <td className="py-3 text-slate-500">Yesterday</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200">
                        Trusted
                      </span>
                    </td>
                    <td className="py-3 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Manage</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      Windows PC · Edge
                    </td>
                    <td className="py-3 text-slate-500">Austin</td>
                    <td className="py-3 text-slate-500">Oct 18</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200">
                        Review
                      </span>
                    </td>
                    <td className="py-3 text-rose-600 dark:text-rose-400 hover:underline cursor-pointer">Sign out</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Showing 3 active sessions</span>
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign out of all other sessions →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Dialog (Matching Screenshot 6) */}
      <TwoFactorSetupDialog
        isOpen={is2FASetupOpen}
        onClose={() => setIs2FASetupOpen(false)}
        onSuccess={() => setIs2FASetupOpen(false)}
      />
    </div>
  );
};
