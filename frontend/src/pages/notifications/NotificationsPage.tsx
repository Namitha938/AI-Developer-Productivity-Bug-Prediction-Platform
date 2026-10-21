import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Check,
  Shield,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<'Unread' | 'All' | 'Assigned to me'>('Unread');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review high-risk code alerts, unresolved reminders, and account events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-slate-500 font-medium hidden sm:block">
            Oct 21, 2026
          </span>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
          >
            Mark all as read
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs"
          >
            Preferences
          </button>
        </div>
      </div>

      {/* 2. Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-4 text-xs font-semibold">
          {(['Unread', 'All', 'Assigned to me'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`pb-1 cursor-pointer transition-colors ${
                tab === t
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* 3. Main Split: Queue & Feeds on Left (8 cols), Focus on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Queue Summary Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Today's queue
                </h3>
                <p className="text-[11px] text-slate-400">
                  5 unread alerts and 2 unresolved reminders.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                5 unread
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">HIGH RISK</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">2</div>
                <p className="text-[11px] text-slate-400">2 open alerts</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">UNRESOLVED</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">2</div>
                <p className="text-[11px] text-slate-400">2 reminders</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">ASSIGNED</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1</div>
                <p className="text-[11px] text-slate-400">1 team handoff</p>
              </div>
            </div>
          </div>

          {/* Group 1: High Risk · Code Alerts */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">High risk</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">Code alerts</span>
              </div>
              <span className="text-[11px] text-slate-400">2 open</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {/* Item 1 */}
              <div className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Unread</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      TP-284 · Duplicate payment capture
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">10:42 AM</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                      High
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                  payments-service captured the same authorization token twice in the same checkout session. The retry loop is still open and may replay the duplicate charge.
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-3.5 pt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[8px]">
                    MC
                  </div>
                  <span>Maya Chen</span>
                  <span>·</span>
                  <span className="font-mono">payments-service · payment.ts</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Unread</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      TP-279 · Unbounded retry loop
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">09:18 AM</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                      High
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                  The retry policy in payments-service does not enforce a terminal backoff after 5 consecutive failures. Tracepoint predicts a 94% chance of cascading timeouts in production.
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-3.5 pt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[8px]">
                    MC
                  </div>
                  <span>Maya Chen</span>
                  <span>·</span>
                  <span className="font-mono">payments-service · retry.ts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Reminder · Unresolved */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">Reminder</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">Unresolved</span>
              </div>
              <span className="text-[11px] text-slate-400">2 open</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
              {/* Reminder 1 */}
              <div className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Unread</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      TP-281 · Checkout timeout review
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Yesterday</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                      Open
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                  The checkout timeout was not updated after the retry policy change. Review the 15-minute window before the next production release.
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-3.5 pt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[8px]">
                    MC
                  </div>
                  <span>Maya Chen</span>
                  <span>·</span>
                  <span className="font-mono">checkout-flow · timeout-config.ts</span>
                </div>
              </div>

              {/* Reminder 2 */}
              <div className="pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Read</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      TP-277 · Rollback window reminder
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Oct 20</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                      Open
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                  The rollback window for the payments-service release closes in 2 hours. Confirm that the canary is stable before the handoff.
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-3.5 pt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[8px]">
                    MC
                  </div>
                  <span>Maya Chen</span>
                  <span>·</span>
                  <span className="font-mono">release-ops · rollback-plan.md</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workspace & Focus Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Workspace Info Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-900 dark:text-white">Workspace</span>
              <span className="text-[11px] text-slate-400 font-normal">Acme</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                MC
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Maya Chen</h4>
                <p className="text-[11px] text-slate-500">maya@acme.dev</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Open issues</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">12</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Risk score</span>
                <span className="text-sm font-bold text-rose-500">74</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-[10px] text-slate-400 block">Assigned</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">3</span>
              </div>
            </div>
          </div>

          {/* Focus Queue Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Focus
            </h4>

            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Unread alerts</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>High-risk issues</span>
                <span className="font-semibold text-rose-500">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Unresolved reminders</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assigned to you</span>
                <span className="font-semibold">1</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
              >
                Mark all read
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
              >
                Preferences
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Recent activity
            </h4>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  TP-284 assigned to you
                </span>
                <span className="text-[10px] text-slate-400">08:05 AM</span>
              </div>

              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  New SSO session detected
                </span>
                <span className="text-[10px] text-slate-400">07:41 AM</span>
              </div>

              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  PR-1182 approved
                </span>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
