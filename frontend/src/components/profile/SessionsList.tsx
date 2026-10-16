import React, { useState, useEffect } from 'react';
import { UserSession } from '../../types';
import { mockAuthApi } from '../../api/mock/mockAuthApi';
import { Laptop, Smartphone, Monitor, ShieldCheck, LogOut, Loader2 } from 'lucide-react';

export const SessionsList: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    mockAuthApi
      .getSessions()
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await mockAuthApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      return Smartphone;
    }
    if (lower.includes('macbook') || lower.includes('laptop')) {
      return Laptop;
    }
    return Monitor;
  };

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
        <span>Loading active sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Sessions</h4>
        <p className="text-xs text-slate-500">
          Devices and browsers that have active credentials to your BugPulse account.
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
        {sessions.map((sess) => {
          const Icon = getDeviceIcon(sess.device);
          return (
            <div
              key={sess.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {sess.browser} • {sess.os} • {sess.location} ({sess.ip})
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <span className="text-[11px] font-mono text-slate-400">
                  {sess.lastActive}
                </span>

                {!sess.isCurrent && (
                  <button
                    type="button"
                    disabled={revokingId === sess.id}
                    onClick={() => handleRevoke(sess.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent transition-colors"
                  >
                    {revokingId === sess.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <LogOut className="w-3 h-3" />
                    )}
                    <span>Sign out</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
