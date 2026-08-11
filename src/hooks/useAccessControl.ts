'use client';

import { useState, useEffect } from 'react';
import { normalizePermissionKey, DEFAULT_ROLE_PERMISSIONS, PermissionKey } from '@/types/settings.types';

export interface UserAccessContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  userLevel?: string;
  dataScope?: string;
  status?: string;
  breederId?: string;
  farmId?: string;
  sourcingCompanyId?: string;
  permissions?: string[];
}

export function useAccessControl() {
  const [currentUser, setCurrentUser] = useState<UserAccessContext | null>(null);
  const [activeRole, setActiveRole] = useState<string>('Super Admin');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('kaksedthan_active_role') || 'Super Admin';
      setActiveRole(savedRole);

      const rawUser = localStorage.getItem('kaksedthan_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setCurrentUser(parsed);
      }
    } catch {
      // Fallback default
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const effectiveRole = currentUser?.role || activeRole || 'Super Admin';

  // ─── ROLE FLAGS ───────────────────────────────────────────────────────────
  const isSuperAdmin =
    effectiveRole === 'Super Admin' ||
    effectiveRole === 'Super Administrator' ||
    currentUser?.userLevel === 'Super Admin';

  const isAdmin =
    isSuperAdmin ||
    effectiveRole === 'Admin' ||
    effectiveRole === 'System Administrator';

  const isBreeder =
    effectiveRole === 'Breeder' ||
    effectiveRole === 'Breeder Account' ||
    currentUser?.userLevel === 'Breeder Account';

  const isFarmOwner =
    effectiveRole === 'Farm Owner' ||
    effectiveRole === 'Farm Manager' ||
    currentUser?.userLevel === 'Farm Owner Account' ||
    currentUser?.userLevel === 'Farmer / Farm Manager Account';

  const isSourcingCompany =
    effectiveRole === 'Sire Sourcing Company' ||
    effectiveRole === 'Company' ||
    effectiveRole === 'Sourcing Manager' ||
    currentUser?.userLevel === 'Sire Sourcing Company Account';

  const isCustomer =
    effectiveRole === 'Customer / Cow Owner' ||
    effectiveRole === 'Customer' ||
    effectiveRole === 'Customer Viewer' ||
    currentUser?.userLevel === 'Customer / Cow Owner Account';

  // ─── BUILD NORMALIZED PERMISSION SET ──────────────────────────────────────
  const buildNormalizedPermissions = (): Set<string> => {
    const set = new Set<string>();

    // From user's stored permissions (localStorage)
    const userPerms = currentUser?.permissions;
    if (Array.isArray(userPerms)) {
      for (const p of userPerms) {
        set.add(p.toLowerCase());
        set.add(normalizePermissionKey(p));
      }
    }

    // From DEFAULT_ROLE_PERMISSIONS fallback
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[effectiveRole] || [];
    for (const p of defaultPerms) {
      set.add((p as string).toLowerCase());
      set.add(normalizePermissionKey(p as string));
    }

    return set;
  };

  /**
   * Check if current user has a given permission key.
   * Handles both new format (sire.view) and legacy format (SIRE.VIEW, sire_view).
   * Super Admin always returns true.
   */
  const can = (permissionKey: string): boolean => {
    if (isAdmin) return true; // Admin and Super Admin bypass

    const permSet = buildNormalizedPermissions();
    const normalizedInput = normalizePermissionKey(permissionKey);

    return (
      permSet.has(permissionKey.toLowerCase()) ||
      permSet.has(normalizedInput.toLowerCase()) ||
      permSet.has(permissionKey) // exact match
    );
  };

  /**
   * Check multiple permissions: returns true if user has ALL of them.
   */
  const canAll = (...keys: string[]): boolean => {
    return keys.every(k => can(k));
  };

  /**
   * Check multiple permissions: returns true if user has ANY of them.
   */
  const canAny = (...keys: string[]): boolean => {
    return keys.some(k => can(k));
  };

  /**
   * Check if current user can access a specific data record based on Data Scope.
   */
  const canAccessRecord = (
    resourceType: 'breeding_program' | 'customer' | 'farm' | 'animal' | 'certification',
    recordData?: { breederId?: string | null; farmId?: string | null; ownerId?: string | null; companyId?: string | null }
  ): boolean => {
    if (isAdmin) return true;
    if (!recordData) return true;

    if (isBreeder && currentUser?.breederId && recordData.breederId) {
      return currentUser.breederId === recordData.breederId;
    }

    if (isFarmOwner && currentUser?.farmId && recordData.farmId) {
      return currentUser.farmId === recordData.farmId;
    }

    if (isSourcingCompany && currentUser?.sourcingCompanyId && recordData.companyId) {
      return currentUser.sourcingCompanyId === recordData.companyId;
    }

    return true;
  };

  return {
    currentUser,
    activeRole: effectiveRole,
    isSuperAdmin,
    isAdmin,
    isBreeder,
    isFarmOwner,
    isSourcingCompany,
    isCustomer,
    isLoaded,
    can,
    canAll,
    canAny,
    canAccessRecord,
  };
}
