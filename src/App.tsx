import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DeveloperDashboard } from './pages/dashboard/DeveloperDashboard';
import { EditorAnalysisPage } from './pages/editor/EditorAnalysisPage';
import { IssuesListPage } from './pages/issues/IssuesListPage';
import { IssueDetailPage } from './pages/issues/IssueDetailPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { TaskBoardPage } from './pages/projects/TaskBoardPage';
import { GitHubIntegrationPage } from './pages/github/GitHubIntegrationPage';
import { AnalyticsReportsPage } from './pages/analytics/AnalyticsReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AdminPanelPage } from './pages/admin/AdminPanelPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthEventListener() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  return null;
}

export function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthEventListener />
        <Routes>
          {/* Public Landing & Marketing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DeveloperDashboard />} />
              <Route path="/editor" element={<EditorAnalysisPage />} />
              <Route path="/issues" element={<IssuesListPage />} />
              <Route path="/issues/:id" element={<IssueDetailPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/board" element={<TaskBoardPage />} />
              <Route path="/github" element={<GitHubIntegrationPage />} />
              <Route path="/analytics" element={<AnalyticsReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

