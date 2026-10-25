
import React from 'react';
import { Monitor, ShieldCheck, Info } from 'lucide-react';

export const SessionsList: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Active Sessions
        </h4>
        <p className="text-xs leading-relaxed text-slate-500">
          Review and manage devices connected to your BugPulse account.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Monitor className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Current sign-in
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Firebase authenticated
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500">
              Your account uses Firebase Authentication. Detailed device
              history and remote session revocation are not connected yet.
            </p>
          </div>

          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
        </div>

        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-[11px] leading-relaxed text-slate-500">
              To sign out on this device, use the app's normal sign-out
              option. This panel does not claim to list every active login
              or revoke sessions on other devices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
