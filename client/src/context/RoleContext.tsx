import React, { createContext, useContext } from 'react';

export type UserRole = 'owner' | 'admin' | 'trainer';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  owner: { id: 'owner', label: 'Владелец', shortLabel: 'Владелец' },
  admin: { id: 'admin', label: 'Администратор', shortLabel: 'Админ' },
  trainer: { id: 'trainer', label: 'Тренер', shortLabel: 'Тренер' },
};

/**
 * Navigation & feature access matrix
 */
export function isRouteAllowed(role: UserRole, path: string): boolean {
  const normPath = path.toLowerCase();

  // Public/client pages accessible to all
  if (
    normPath === '/' || 
    normPath === '/schedule' || 
    normPath === '/login' || 
    normPath === '/for-studios' || 
    normPath === '/profile' || 
    normPath === '/settings'
  ) {
    return true;
  }

  // Owner: Full access
  if (role === 'owner') {
    return true;
  }

  // Admin:
  // - Allowed: /Admin, /admin/schedule, /admin/students, /admin/directions, /admin/finance (cashier)
  // - Forbidden: /admin/staff, /admin/notifications, /admin/settings
  if (role === 'admin') {
    if (
      normPath === '/admin' || 
      normPath === '/admin/schedule' || 
      normPath === '/admin/students' || 
      normPath === '/admin/directions' || 
      normPath === '/admin/finance'
    ) {
      return true;
    }
    if (
      normPath === '/admin/staff' || 
      normPath === '/admin/notifications' || 
      normPath === '/admin/settings'
    ) {
      return false;
    }
    return true;
  }

  // Trainer:
  // - Allowed: /admin/schedule, /Admin, /schedule, /admin/directions (my groups)
  // - Forbidden: /admin/finance, /admin/staff, /admin/notifications, /admin/settings, /admin/students
  if (role === 'trainer') {
    if (
      normPath === '/admin' || 
      normPath === '/admin/schedule' || 
      normPath === '/schedule' || 
      normPath === '/admin/directions'
    ) {
      return true;
    }
    return false;
  }

  return true;
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === 'owner') return '/Admin';
  if (role === 'admin') return '/Admin';
  if (role === 'trainer') return '/admin/schedule';
  return '/Admin';
}

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isAllowed: (path: string) => boolean;
  roleConfig: RoleConfig;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const currentRole: UserRole = 'owner';

  const setRole = (_newRole: UserRole) => {
    // Role is locked to owner
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setRole,
        isAllowed: () => true,
        roleConfig: ROLES.owner,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
