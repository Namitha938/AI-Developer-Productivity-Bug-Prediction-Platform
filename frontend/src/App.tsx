
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { getRoleHome } from './utils/roleRedirect';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import { PublicOnlyRoute } from './pages/auth/PublicOnlyRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { OAuthCallbackPage } from './pages/auth/OAuthCallbackPage';

// Shared pages
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

// Developer pages
import { DeveloperDashboard } from './pages/dashboard/DeveloperDashboard';
import { EditorAnalysisPage } from './pages/editor/EditorAnalysisPage';
import { IssuesListPage } from './pages/issues/IssuesListPage';
import { IssueDetailPage } from './pages/issues/IssueDetailPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { TaskBoardPage } from './pages/projects/TaskBoardPage';
import { GitHubIntegrationPage } from './pages/github/GitHubIntegrationPage';

// Tech Lead reports
import { AnalyticsReportsPage } from './pages/analytics/AnalyticsReportsPage';

// Admin pages
import { AdminPanelPage } from './pages/admin/AdminPanelPage';

import { NotFoundPage } from './pages/NotFoundPage';
import { TeamsPage } from './pages/admin/TeamsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthEventListener() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout, navigate]);

  useEffect(() => {
    // Role changes should not leave the user on another role's workspace.
    if (user) {
      const home = getRoleHome(user.role);

      if (
        (user.role === 'admin' && window.location.pathname === '/dashboard') ||
        (user.role === 'developer' && window.location.pathname.startsWith('/admin')) ||
        (user.role === 'tech_lead' &&
          (window.location.pathname === '/dashboard' ||
            window.location.pathname.startsWith('/admin')))
      ) {
        navigate(home, { replace: true });
      }
    }
  }, [user, navigate]);

  return null;
}

export function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthEventListener />

        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public-only authentication pages */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Authentication callbacks */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Authenticated shared pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<ProfilePage />} />
              <Route path="/security" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Developer-only workspace */}
          <Route element={<ProtectedRoute allowedRoles={['developer']} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DeveloperDashboard />} />
              <Route path="/editor" element={<EditorAnalysisPage />} />
              <Route path="/issues" element={<IssuesListPage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/board" element={<TaskBoardPage />} />
              <Route path="/github" element={<GitHubIntegrationPage />} />
            </Route>
          </Route>

          {/* Tech Lead-only reports */}
          <Route element={<ProtectedRoute allowedRoles={['tech_lead','developer']} />}>
            <Route element={<AppLayout />}>
              <Route path="/analytics" element={<AnalyticsReportsPage />} />
            </Route>
          </Route>

          {/* Admin-only workspace */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/admin/team" element={<TeamsPage />} />
            </Route>
          </Route>

          {/* Unknown route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
