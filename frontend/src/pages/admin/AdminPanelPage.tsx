import React, { useState } from 'react';
import {
  Users,
  Shield,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Developer';
  status: 'Active' | 'Invited' | 'Suspended';
  avatarInitials: string;
}

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'u-1',
    name: 'Jordan Rivera',
    email: 'jordan.rivera@acme.ai',
    role: 'Administrator',
    status: 'Active',
    avatarInitials: 'JR',
  },
  {
    id: 'u-2',
    name: 'Maya Chen',
    email: 'maya.chen@acme.ai',
    role: 'Developer',
    status: 'Active',
    avatarInitials: 'MC',
  },
  {
    id: 'u-3',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@acme.ai',
    role: 'Developer',
    status: 'Invited',
    avatarInitials: 'AK',
  },
  {
    id: 'u-4',
    name: 'Nina Patel',
    email: 'nina.patel@acme.ai',
    role: 'Developer',
    status: 'Suspended',
    avatarInitials: 'NP',
  },
];

export const AdminPanelPage: React.FC = () => {
  const [userTab, setUserTab] = useState<'All users' | 'Active' | 'Invited' | 'Suspended'>('All users');
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) => {
    if (userTab !== 'All users' && u.status !== userTab) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header with Breadcrumb, Title & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">Workspace</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
              PROD
            </span>
            <span className="text-slate-400">Acme Engineering · jordan.rivera@acme.ai</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Admin dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor developer productivity, bug prediction, and system health across Acme Engineering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Oct 21, 2026
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users, repos, or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 w-52 sm:w-64"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite user</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active users */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Active users</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">128</div>
          <p className="text-[11px] text-slate-400 mt-1">24 engineers online now</p>
        </div>

        {/* Repos analyzed */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Repos analyzed</span>
            <span className="text-slate-400 font-medium">4 live</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">4</div>
          <p className="text-[11px] text-slate-400 mt-1">1,284 commits processed today</p>
        </div>

        {/* System usage */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">System usage</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Healthy</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">84%</div>
          <p className="text-[11px] text-slate-400 mt-1">CPU 18%, memory 62%</p>
        </div>

        {/* Prediction accuracy */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Prediction accuracy</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+3.1%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">92.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">18 critical bugs predicted</p>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Users & Roles + Administrative Activity */}
        <div className="space-y-6">
          {/* Users & roles */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Users & roles
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage access, status, and invite controls
                </p>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin view
              </span>
            </div>

            {/* User Filter Tabs */}
            <div className="flex items-center gap-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800 pb-2">
              {(['All users', 'Active', 'Invited', 'Suspended'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setUserTab(tab)}
                  className={`pb-1 transition-colors cursor-pointer ${
                    userTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* User Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {u.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {u.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                          : u.status === 'Invited'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                      }`}
                    >
                      {u.status}
                    </span>
                    <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium ml-1">
                      Edit
                    </button>
                    <button className="text-slate-400 hover:text-rose-500 font-medium">
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative activity */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Administrative activity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Recent actions from the admin console
                </p>
              </div>
              <span className="text-[11px] text-slate-400">Last 24h</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Jordan Rivera invited Maya Chen
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Developer role assigned to atlas-web and payments-service
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">09:14</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      SSO policy updated for identity-api
                    </span>
                    <p className="text-[11px] text-slate-400">
                      MFA enforcement enabled for all admin actions
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">08:42</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Branch protection rule created
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Main branch now requires 2 approvals before merge
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">07:18</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Critical bug prediction threshold reached
                    </span>
                    <p className="text-[11px] text-slate-400">
                      3 high-risk commits detected in event-worker
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">06:55</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis records + System usage */}
        <div className="space-y-6">
          {/* Analysis records */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Analysis records
                </h3>
                <p className="text-[11px] text-slate-400">
                  Latest repository analysis and prediction outcomes
                </p>
              </div>
              <span className="text-[11px] text-slate-400">Updated 2m ago</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2 font-medium">REPOSITORY</th>
                    <th className="py-2 font-medium">STATUS</th>
                    <th className="py-2 font-medium">DATE</th>
                    <th className="py-2 font-medium">OUTCOME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      payments-service
                      <span className="block text-[10px] text-slate-400 font-normal">Node.js · TypeScript</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                        Healthy
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">Oct 21</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">0 critical bugs predicted</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      atlas-web
                      <span className="block text-[10px] text-slate-400 font-normal">React · Next.js</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200">
                        Review
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">Oct 21</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">2 high-risk commits detected</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      event-worker
                      <span className="block text-[10px] text-slate-400 font-normal">Go · Kafka</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                        Critical
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">Oct 20</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">3 critical bugs predicted</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      identity-api
                      <span className="block text-[10px] text-slate-400 font-normal">Rust · gRPC</span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                        Healthy
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">Oct 20</td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">1 warning detected</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* System usage */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  System usage
                </h3>
                <p className="text-[11px] text-slate-400">
                  Compute, storage, and analysis capacity
                </p>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">84% utilized</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Compute</span>
                  <span className="font-semibold">18%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Memory</span>
                  <span className="font-semibold">62%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Storage</span>
                  <span className="font-semibold">41%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '41%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Analysis queue</span>
                  <span className="font-semibold">12%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Avg. prediction time: <strong className="text-slate-700 dark:text-slate-200">1.2s</strong></span>
                <span>Model refresh: <strong className="text-slate-700 dark:text-slate-200">14:00 UTC</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
