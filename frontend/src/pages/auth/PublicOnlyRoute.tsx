
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { getRoleHome } from '../../utils/roleRedirect';

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Allow password recovery pages even when the user is logged in.
  const recoveryPaths = ['/forgot-password', '/reset-password'];

  if (recoveryPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  // Allow public-only pages for logged-out users.
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Authentication state exists, but user data is not ready.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated users away from login/register.
  return <Navigate to={getRoleHome(user.role)} replace />;
};
