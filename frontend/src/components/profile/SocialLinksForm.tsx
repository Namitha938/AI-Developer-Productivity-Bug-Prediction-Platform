import React, { useState } from 'react';
import { SocialLinks } from '../../types';
import {
  Github,
  Linkedin,
  Twitter,
  Globe,
  Layers,
  ExternalLink,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface SocialLinksFormProps {
  initialLinks?: SocialLinks;
  onSave: (links: SocialLinks) => Promise<void>;
}

export const SocialLinksForm: React.FC<SocialLinksFormProps> = ({ initialLinks = {}, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateUrl = (key: keyof SocialLinks, val?: string): string | null => {
    if (!val || !val.trim()) return null;
    const trimmed = val.trim();

    if (!trimmed.startsWith('https://')) {
      return 'URL must start with secure https:// protocol.';
    }

    try {
      const parsed = new URL(trimmed);
      if (key === 'github' && !parsed.hostname.includes('github.com')) {
        return 'Must be a valid github.com profile link.';
      }
      if (key === 'linkedin' && !parsed.hostname.includes('linkedin.com')) {
        return 'Must be a valid linkedin.com profile link.';
      }
      if (key === 'twitter' && !parsed.hostname.includes('twitter.com') && !parsed.hostname.includes('x.com')) {
        return 'Must be a valid twitter.com or x.com profile link.';
      }
      if (key === 'stackoverflow' && !parsed.hostname.includes('stackoverflow.com')) {
        return 'Must be a valid stackoverflow.com profile link.';
      }
    } catch {
      return 'Please enter a valid URL.';
    }

    return null;
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    (Object.keys(links) as Array<keyof SocialLinks>).forEach((key) => {
      const err = validateUrl(key, links[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    try {
      await onSave(links);
      setIsEditing(false);
    } catch {
      setErrors({ form: 'Failed to save social links.' });
    } finally {
      setIsSaving(false);
    }
  };

  const config = [
    { key: 'github' as const, label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter' as const, label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/username' },
    { key: 'website' as const, label: 'Portfolio Website', icon: Globe, placeholder: 'https://yourdomain.com' },
    { key: 'stackoverflow' as const, label: 'Stack Overflow', icon: Layers, placeholder: 'https://stackoverflow.com/users/...' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Social & Developer Links</h4>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit links</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLinks(initialLinks);
                setErrors({});
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {errors.form && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* View Mode */}
      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.map((item) => {
            const Icon = item.icon;
            const linkUrl = links[item.key];
            return (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}:</span>
                  {linkUrl ? (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                    >
                      {linkUrl.replace('https://', '')}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>
                {linkUrl && (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Open link in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3">
          {config.map((item) => {
            const Icon = item.icon;
            const fieldError = errors[item.key];
            return (
              <div key={item.key} className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.label}</span>
                </label>
                <input
                  type="url"
                  value={links[item.key] || ''}
                  onChange={(e) => {
                    setLinks({ ...links, [item.key]: e.target.value });
                    if (errors[item.key]) {
                      setErrors({ ...errors, [item.key]: '' });
                    }
                  }}
                  placeholder={item.placeholder}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                    fieldError ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {fieldError && <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">{fieldError}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
