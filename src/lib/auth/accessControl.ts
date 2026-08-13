import { herdbookRepository } from '@/repositories/herdbook.repository';
import { query } from '@/config/database';

export interface AuthenticatedUserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  userLevel: string;
  dataScope: 'ASSIGNED_RECORD' | 'OWN_FARM_ONLY' | 'OWN_BREEDER_ONLY' | 'COMPANY_ONLY' | 'GLOBAL' | string;
  status: string;
  breederId?: string | null;
  farmId?: string | null;
  sourcingCompanyId?: string | null;
  effectivePermissions: string[];
}

/**
 * Resolves the authenticated user identity and computes their effective permissions.
 * Union of permissions from all assigned roles. Super Admin has full permission set.
 */
export async function resolveAuthenticatedUserContext(userEmail: string): Promise<AuthenticatedUserContext | null> {
  if (!userEmail) return null;

  const res = await query(`
    SELECT u.id, u.name, u.email, u.role, u.user_level, u.user_level_id, u.data_scope, u.status, u.breeder_id, u.farm_id, u.sourcing_company_id
    FROM users u
    WHERE LOWER(u.email) = $1
    LIMIT 1
  `, [userEmail.trim().toLowerCase()]);

  if (res.rows.length === 0) return null;

  const user = res.rows[0];

  // If user is disabled, reject authentication context
  if (user.status && user.status.toLowerCase() === 'disabled') {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      userLevel: user.user_level,
      dataScope: user.data_scope || 'ASSIGNED_RECORD',
      status: 'Disabled',
      breederId: user.breeder_id,
      farmId: user.farm_id,
      sourcingCompanyId: user.sourcing_company_id,
      effectivePermissions: []
    };
  }

  const isSuperAdmin = user.role === 'Super Admin' || user.role === 'Super Administrator'
    || user.user_level === 'Super Admin' || user.user_level === 'Super Admin Account';

  const isAdmin = isSuperAdmin
    || (user.role && user.role.toLowerCase().includes('admin'))
    || (user.user_level && user.user_level.toLowerCase().includes('admin'));

  // Admin and Super Admin receive all permissions, but preserve exact role and userLevel from PostgreSQL database
  if (isAdmin) {
    const allPermsRes = await query(`SELECT key FROM permissions;`);
    const allKeys = allPermsRes.rows.map(r => r.key);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || (isSuperAdmin ? 'Super Admin' : 'Admin'),
      userLevel: user.user_level || (isSuperAdmin ? 'Super Admin Account' : 'Admin'),
      dataScope: user.data_scope || 'GLOBAL',
      status: user.status || 'Active',
      breederId: user.breeder_id,
      farmId: user.farm_id,
      sourcingCompanyId: user.sourcing_company_id,
      effectivePermissions: allKeys
    };
  }

  // Fetch permissions assigned to user's role via role_permissions and user level
  const permRes = await query(`
    SELECT DISTINCT permission_key FROM (
      SELECT rp.permission_key
      FROM role_permissions rp
      JOIN roles r ON r.id = rp.role_id
      WHERE LOWER(r.name) = LOWER($1) AND r.status = 'Active'
      UNION
      SELECT ulp.permission_key
      FROM user_level_permissions ulp
      JOIN user_levels ul ON ul.id = ulp.user_level_id
      WHERE (ul.id = $2 OR LOWER(ul.name) = LOWER($3)) AND ul.status = 'Active'
      UNION
      SELECT ulm.module_key as permission_key
      FROM user_level_modules ulm
      JOIN user_levels ul ON ul.id = ulm.user_level_id
      WHERE (ul.id = $2 OR LOWER(ul.name) = LOWER($3)) AND ul.status = 'Active' AND ulm.is_available = true
    ) as combined_perms;
  `, [user.role || '', user.user_level_id || '', user.user_level || '']);

  const effectivePermissions = permRes.rows.map(r => r.permission_key);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    userLevel: user.user_level,
    dataScope: user.data_scope || 'ASSIGNED_RECORD',
    status: user.status || 'Active',
    breederId: user.breeder_id,
    farmId: user.farm_id,
    sourcingCompanyId: user.sourcing_company_id,
    effectivePermissions
  };
}

/**
 * Checks whether a user has a specific granular permission key.
 */
export function hasPermission(userCtx: AuthenticatedUserContext | null, permissionKey: string): boolean {
  if (!userCtx || userCtx.status === 'Disabled') return false;
  if (userCtx.role === 'Super Admin' || userCtx.dataScope === 'GLOBAL') return true;

  const keyLower = permissionKey.toLowerCase();
  return userCtx.effectivePermissions.some(p => p.toLowerCase() === keyLower);
}

/**
 * Evaluates whether a user can access a specific resource record based on Data Scope and Ownership.
 */
export function evaluateDataScopeAccess(
  userCtx: AuthenticatedUserContext | null,
  resourceType: 'breeding_program' | 'customer' | 'farm' | 'animal' | 'certification',
  recordData?: { breederId?: string | null; farmId?: string | null; ownerId?: string | null; companyId?: string | null }
): boolean {
  if (!userCtx || userCtx.status === 'Disabled') return false;
  if (userCtx.role === 'Super Admin' || userCtx.dataScope === 'GLOBAL') return true;

  if (!recordData) return true;

  const scope = userCtx.dataScope;

  // 1. Breeder Scope Isolation
  if (scope === 'OWN_BREEDER_ONLY' || userCtx.userLevel === 'Breeder Account' || userCtx.role === 'Breeder') {
    if (userCtx.breederId && recordData.breederId) {
      return userCtx.breederId === recordData.breederId;
    }
  }

  // 2. Farm Scope Isolation
  if (scope === 'OWN_FARM_ONLY' || userCtx.userLevel === 'Farm Owner Account' || userCtx.role === 'Farm Manager') {
    if (userCtx.farmId && recordData.farmId) {
      return userCtx.farmId === recordData.farmId;
    }
  }

  // 3. Sire Sourcing Company Scope
  if (scope === 'COMPANY_ONLY' || userCtx.userLevel === 'Sire Sourcing Company Account') {
    if (userCtx.sourcingCompanyId && recordData.companyId) {
      return userCtx.sourcingCompanyId === recordData.companyId;
    }
  }

  return true;
}

/**
 * Server Action / API Authorization Security Guard.
 * Validates caller identity, active status, action permission, and record data scope.
 * Throws error if unauthorized.
 */
export async function enforceActionPermission(
  callerEmail: string | undefined | null,
  requiredPermission: string,
  resourceType?: 'breeding_program' | 'customer' | 'farm' | 'animal' | 'certification',
  recordData?: { breederId?: string | null; farmId?: string | null; ownerId?: string | null; companyId?: string | null }
): Promise<AuthenticatedUserContext> {
  if (!callerEmail) {
    throw new Error(`[401 Unauthorized] Authentication session required for action '${requiredPermission}'`);
  }

  const userCtx = await resolveAuthenticatedUserContext(callerEmail);

  if (!userCtx || userCtx.status === 'Disabled') {
    throw new Error(`[403 Forbidden] User account '${callerEmail}' is disabled or does not exist.`);
  }

  if (!hasPermission(userCtx, requiredPermission)) {
    throw new Error(`[403 Forbidden] Permission '${requiredPermission}' is required to perform this action.`);
  }

  if (resourceType && recordData) {
    const isScopeValid = evaluateDataScopeAccess(userCtx, resourceType, recordData);
    if (!isScopeValid) {
      throw new Error(`[403 Forbidden] Access denied. Record belongs outside your authorized data scope.`);
    }
  }

  return userCtx;
}
