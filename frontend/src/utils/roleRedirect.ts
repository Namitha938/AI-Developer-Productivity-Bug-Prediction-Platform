
import type { UserRole } from '../types';

export function getRoleHome(role?: UserRole | null): string {
  switch (role) {
    case 'admin':
      return '/admin';

    case 'tech_lead':
      return '/reports';

    case 'developer':
    default:
      return '/dashboard';
  }
}
