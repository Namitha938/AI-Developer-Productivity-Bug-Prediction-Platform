
import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  X,
  Loader2,
  AlertTriangle,
  UsersRound,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface Team {
  id: string;
  name: string;
  description: string;
  member_ids: string[];
  member_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface TeamMember {
  uid: string;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

interface UserOption {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

const panel =
  'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1322]';

function errorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };

  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
}

function displayUser(user: UserOption | TeamMember): string {
  return (
    user.full_name?.trim() ||
    user.username ||
    user.email ||
    ('uid' in user ? user.uid : '') ||
    'Unknown user'
  );
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function normalizeTeam(raw: Record<string, unknown>): Team {
  const members = Array.isArray(raw.member_ids)
    ? raw.member_ids.map(String)
    : [];

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    member_ids: members,
    member_count:
      typeof raw.member_count === 'number' ? raw.member_count : members.length,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : null,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : null,
  };
}

function normalizeUsers(data: unknown): UserOption[] {
  const response = data as {
    items?: Record<string, unknown>[];
    users?: Record<string, unknown>[];
  } | Record<string, unknown>[] | null;

  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.users ?? [];

  return items.map((raw) => ({
    id: String(raw.id ?? raw.uid ?? ''),
    username: String(raw.username ?? ''),
    email: String(raw.email ?? ''),
    full_name: typeof raw.full_name === 'string' ? raw.full_name : null,
    is_active: raw.is_active !== false,
  })).filter((user) => Boolean(user.id));
}

export const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [memberUid, setMemberUid] = useState('');

  const loadTeams = useCallback(async (refresh = false) => {
    setError('');
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiClient.get('/admin/teams', {
        params: { limit: 100, ...(search.trim() ? { q: search.trim() } : {}) },
      });

      const data = response.data;
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setTeams(items.map((item: Record<string, unknown>) => normalizeTeam(item)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/users', {
        params: { limit: 100, is_active: true },
      });
      setUsers(normalizeUsers(response.data));
    } catch (err) {
      setError((previous) => previous || errorMessage(err));
    }
  }, []);

  const loadTeamDetails = useCallback(async (team: Team) => {
    setError('');
    try {
      const response = await apiClient.get(
        `/admin/teams/${encodeURIComponent(team.id)}`,
      );

      const data = response.data;
      const normalized = normalizeTeam(data);

      setSelectedTeam(normalized);
      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTeams();
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [loadTeams]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const startCreate = () => {
    setEditingTeam(null);
    setTeamName('');
    setDescription('');
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setDescription(team.description);
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const saveTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = teamName.trim();
    if (name.length < 2) {
      setError('Team name must contain at least two characters.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      if (editingTeam) {
        await apiClient.patch(
          `/admin/teams/${encodeURIComponent(editingTeam.id)}`,
          { name, description: description.trim() },
        );
        setNotice('Team updated successfully.');
      } else {
        await apiClient.post('/admin/teams', {
          name,
          description: description.trim(),
        });
        setNotice('Team created successfully.');
      }

      setFormOpen(false);
      await loadTeams(true);

if (editingTeam?.id && editingTeam.id === selectedTeam?.id) {
  const refreshed = await apiClient.get(
    `/admin/teams/${encodeURIComponent(editingTeam.id)}`,
  );

  setSelectedTeam(normalizeTeam(refreshed.data));
  setMembers(
    Array.isArray(refreshed.data.members) ? refreshed.data.members : [],
  );
}
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteTeam = async (team: Team) => {
    if (!window.confirm(`Delete "${team.name}"? This removes the team record, not its user accounts.`)) {
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await apiClient.delete(`/admin/teams/${encodeURIComponent(team.id)}`);
      if (selectedTeam?.id === team.id) {
        setSelectedTeam(null);
        setMembers([]);
      }
      setNotice(`"${team.name}" was deleted.`);
      await loadTeams(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeam || !memberUid) return;

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await apiClient.post(
        `/admin/teams/${encodeURIComponent(selectedTeam.id)}/members`,
        { uid: memberUid },
      );

      setMemberUid('');
      setNotice('Member added successfully.');
      await loadTeamDetails(selectedTeam);
      await loadTeams(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (member: TeamMember) => {
    if (!selectedTeam) return;

    if (!window.confirm(`Remove ${displayUser(member)} from "${selectedTeam.name}"?`)) {
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      await apiClient.delete(
        `/admin/teams/${encodeURIComponent(selectedTeam.id)}/members/${encodeURIComponent(member.uid)}`,
      );

      setNotice('Member removed successfully.');
      await loadTeamDetails(selectedTeam);
      await loadTeams(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const memberUidSet = new Set(selectedTeam?.member_ids ?? []);
  const availableUsers = users.filter((user) => (
    user.is_active && !memberUidSet.has(user.id)
  ));

  return (
    <div className="space-y-6 font-sans">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace / Administration / Teams
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Team management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize registered users into teams using live Firestore data.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadTeams(true)}
            disabled={refreshing || busy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Create team
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span className="break-words">{error}</span>
          <button type="button" className="ml-auto" onClick={() => setError('')} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={panel}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Teams returned</span>
            <UsersRound size={19} className="text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{teams.length}</p>
          <p className="mt-1 text-xs text-slate-400">From the teams API</p>
        </div>

        <div className={panel}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Memberships</span>
            <Users size={19} className="text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {teams.reduce((sum, team) => sum + team.member_count, 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Sum of team member counts</p>
        </div>

        <div className={panel}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Active users available</span>
            <UserPlus size={19} className="text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {users.filter((user) => user.is_active).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Returned by the admin users API</p>
        </div>
      </div>

      {formOpen && (
        <section className={panel}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {editingTeam ? 'Edit team' : 'Create a team'}
            </h2>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close team form">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={saveTeam} className="space-y-4">
            <div>
              <label htmlFor="team-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Team name
              </label>
              <input
                id="team-name"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="e.g. Platform Engineering"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="team-description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Description
              </label>
              <textarea
                id="team-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="What does this team work on?"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {busy && <Loader2 size={15} className="animate-spin" />}
                {editingTeam ? 'Save changes' : 'Create team'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className={panel}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Teams</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a team to manage its members.</p>
            </div>
            <div className="relative sm:max-w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search teams"
                placeholder="Search teams..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" /> Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="py-12 text-center">
              <UsersRound size={30} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">No teams found</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {search ? 'Try another search.' : 'Create a team to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => {
                const active = selectedTeam?.id === team.id;

                return (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => void loadTeamDetails(team)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? 'border-blue-400 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/30'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <UsersRound size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{team.name}</h3>
                          <ChevronRight size={16} className="shrink-0 text-slate-400" />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {team.description || 'No description provided.'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1"><Users size={13} /> {team.member_count} members</span>
                          <span>Created {formatDate(team.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={panel}>
          {!selectedTeam ? (
            <div className="py-12 text-center">
              <Users size={30} className="mx-auto text-slate-300 dark:text-slate-600" />
              <h2 className="mt-3 text-base font-semibold text-slate-800 dark:text-white">Team details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a team to view and manage its members.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-bold text-slate-900 dark:text-white">{selectedTeam.name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {selectedTeam.description || 'No description provided.'}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {members.length} member record{members.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => startEdit(selectedTeam)} aria-label="Edit selected team" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => void deleteTeam(selectedTeam)} disabled={busy} aria-label="Delete selected team" className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={addMember} className="mt-4 space-y-2">
                <label htmlFor="team-member" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Add an active user
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    id="team-member"
                    value={memberUid}
                    onChange={(event) => setMemberUid(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {displayUser(user)} — {user.email}
                      </option>
                    ))}
                  </select>
                  <button type="submit" disabled={busy || !memberUid} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                    Add member
                  </button>
                </div>
                {availableUsers.length === 0 && (
                  <p className="text-xs text-slate-400">No eligible active users are available to add.</p>
                )}
              </form>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Members</h3>

                {members.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    This team has no members yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member) => (
                      <div key={member.uid} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {displayUser(member).split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{displayUser(member)}</p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                            <p className="truncate text-[10px] text-slate-400">{member.uid}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeMember(member)}
                          disabled={busy}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"
                        >
                          <UserMinus size={14} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeamsPage;
