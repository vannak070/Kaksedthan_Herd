'use client';

import React, { useState, useEffect } from 'react';
import { 
  MasterSetup, 
  UserRoleItem, 
  CustomRoleDefinition, 
  PermissionKey, 
  PERMISSION_MODULES, 
  ALL_PERMISSIONS, 
  DEFAULT_ROLE_PERMISSIONS,
  APPROVED_USER_LEVELS,
  APPROVED_ROLES,
  UserLevelItem,
  DataScopeType
} from '@/types/settings.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { 
  Settings, 
  Shield, 
  Plus, 
  Trash2, 
  Edit2, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Award,
  Layers,
  UserCheck,
  Building2,
  Lock,
  Eye,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSettingsAction } from '@/app/actions';
import { ConfirmModal } from './ui/confirm-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { TablePagination } from './common/TablePagination';
import UserAccessDetailsModal from './settings/UserAccessDetailsModal';

interface SettingsTabProps {
  settings?: MasterSetup;
  data?: any;
  currentUser?: any;
  initialSubTab?: 'livestock' | 'breeding' | 'financial' | 'users';
  initialSection?: 'livestock' | 'breeding' | 'financial' | 'users';
}

export default function SettingsTab({ settings: rawSettings, data, currentUser, initialSubTab = 'users', initialSection }: SettingsTabProps) {
  const settings: MasterSetup = rawSettings || data?.settings || {
    breeds: ['Angus Cross', 'Brahman', 'Wagyu', 'Charolais Cross', 'Local Cow'],
    categories: ['Sire', 'Dam', 'Calf'],
    farms: ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ'],
    locations: ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ'],
    healthStatuses: ['Good', 'Fair', 'Poor', 'Sick', 'Quarantine'],
    vaccineTypes: ['FMD', 'Blackleg', 'Anthrax'],
    expenseCategories: ['Feed', 'Medicine', 'Labor', 'Equipment'],
    users: [
      { id: '1', name: 'Vannak Admin', email: 'vannak@snrfarm.com', userLevel: 'Super Admin Account', role: 'Super Admin', dataScope: 'GLOBAL', status: 'Active', permissions: ALL_PERMISSIONS },
      { id: '2', name: 'Dr. Vannak Breeder', email: 'breeder@snrfarm.com', userLevel: 'Breeder Account', role: 'Breeding Specialist', dataScope: 'ASSIGNED_RECORD', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] },
      { id: '3', name: 'Bona Farm Owner', email: 'bona.v@snrfarm.com', userLevel: 'Farm Owner Account', role: 'Farm Manager', dataScope: 'FARM', farmLocation: 'រទាំង', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] },
      { id: '4', name: 'Sophea Cow Owner', email: 'sophea@customer.com', userLevel: 'Customer / Cow Owner', role: 'Customer Viewer', dataScope: 'CUSTOMER', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] },
      { id: '5', name: 'ABS Global Sourcing Co.', email: 'sourcing@absglobal.com', userLevel: 'Sire Sourcing Company', role: 'Sourcing Manager', dataScope: 'SOURCING_COMPANY', companyName: 'ABS Global', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'] }
    ],
    roles: APPROVED_ROLES,
    userLevels: APPROVED_USER_LEVELS
  };

  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'livestock' | 'breeding' | 'users'>('users');
  const [rbacTab, setRbacTab] = useState<'users' | 'roles' | 'permissions' | 'levels' | 'access'>('users');

  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // Current Roles list
  const currentRoles: CustomRoleDefinition[] = settings.roles && settings.roles.length > 0 ? settings.roles : APPROVED_ROLES;
  const currentUserLevels: UserLevelItem[] = settings.userLevels && settings.userLevels.length > 0 ? settings.userLevels : APPROVED_USER_LEVELS;

  // User form & permission states
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userLevel, setUserLevel] = useState<string>('Farm Owner Account');
  const [userRole, setUserRole] = useState<string>('System Administrator');
  const [userDataScope, setUserDataScope] = useState<DataScopeType>('GLOBAL');
  const [userPermissions, setUserPermissions] = useState<PermissionKey[]>(ALL_PERMISSIONS);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFarmLocation, setUserFarmLocation] = useState<string>('');
  const [userCompanyName, setUserCompanyName] = useState<string>('');
  const [userPhone, setUserPhone] = useState('');
  const [userDepartment, setUserDepartment] = useState('Operations');
  const [userNotes, setUserNotes] = useState('');
  const [userStatus, setUserStatus] = useState<'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Disabled'>('Active');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserRoleItem | null>(null);

  // Custom Role Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRoleDefinition | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleCategory, setRoleCategory] = useState<string>('Breeding');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<PermissionKey[]>(ALL_PERMISSIONS);

  // Mutation to save settings updates to server action
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: MasterSetup) => {
      const res = await updateSettingsAction(updatedSettings);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livestock'] });
    }
  });

  const handleStartEditUser = (user: UserRoleItem) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPhone(user.phone || '');
    setUserDepartment(user.department || 'Operations');
    setUserNotes(user.notes || '');
    setUserStatus((user.status as any) || 'Active');
    setUserPassword(user.password || '');
    setUserLevel(user.userLevel || 'System Administrator');
    setUserRole(user.role);
    setUserDataScope(user.dataScope || 'GLOBAL');
    const matchedRole = currentRoles.find(r => r.name === user.role);
    setUserPermissions(user.permissions && user.permissions.length > 0 ? user.permissions : (matchedRole ? matchedRole.permissions : (DEFAULT_ROLE_PERMISSIONS[user.role] || [])));
    setUserFarmLocation(user.farmLocation || '');
    setUserCompanyName(user.companyName || '');
    setIsAddingUser(true);
  };

  const handleRoleSelectChange = (newRoleName: string) => {
    setUserRole(newRoleName);
    const matchedRole = currentRoles.find(r => r.name === newRoleName);
    if (matchedRole) {
      setUserPermissions(matchedRole.permissions);
    }
  };

  const togglePermission = (key: PermissionKey) => {
    setUserPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    let updatedUsers = [...(settings.users || [])];

    if (editingUserId) {
      updatedUsers = updatedUsers.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            name: userName.trim(),
            email: userEmail.trim(),
            phone: userPhone.trim() || undefined,
            department: userDepartment.trim() || undefined,
            notes: userNotes.trim() || undefined,
            userLevel: userLevel as any,
            role: userRole,
            dataScope: userDataScope,
            status: userStatus as any,
            accountType: 'INTERNAL',
            password: userPassword.trim() || u.password || 'password123',
            permissions: userPermissions,
            farmLocation: userFarmLocation.trim() || undefined,
            companyName: userCompanyName.trim() || undefined
          };
        }
        return u;
      });
    } else {
      const newUser: UserRoleItem = {
        id: `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: userName.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim() || undefined,
        department: userDepartment.trim() || undefined,
        notes: userNotes.trim() || undefined,
        accountType: 'INTERNAL',
        userLevel: userLevel as any,
        role: userRole,
        dataScope: userDataScope,
        status: userStatus,
        password: userPassword.trim() || 'password123',
        permissions: userPermissions,
        farmLocation: userFarmLocation.trim() || undefined,
        companyName: userCompanyName.trim() || undefined
      };
      updatedUsers.push(newUser);
    }

    const updatedSettings: MasterSetup = {
      ...settings,
      users: updatedUsers
    };

    updateSettingsMutation.mutate(updatedSettings);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserDepartment('Operations');
    setUserNotes('');
    setUserStatus('Active');
    setUserPassword('');
    setUserLevel('System Administrator');
    setUserRole('System Administrator');
    setUserDataScope('GLOBAL');
    setUserPermissions(ALL_PERMISSIONS);
    setUserFarmLocation('');
    setUserCompanyName('');
    setEditingUserId(null);
    setIsAddingUser(false);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = (settings.users || []).map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus as any };
      }
      return u;
    });

    updateSettingsMutation.mutate({
      ...settings,
      users: updatedUsers
    });
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Internal Operation Accounts & Access Control</h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Manage staff operation accounts, system roles, and permission catalog. User Level Access Templates are configured in <a href="/settings/user-levels" className="text-indigo-300 underline font-bold hover:text-white">User Level Templates</a>.
            </p>
          </div>
        </div>
        <a
          href="/settings/user-levels"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-sm transition-all shrink-0"
        >
          <Layers className="h-4 w-4 text-indigo-300" />
          <span>User Level Templates →</span>
        </a>
      </div>

      {/* 3 CLEAN ACCESS CONTROL SUBTABS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-2 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setRbacTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'users' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="h-4 w-4 text-indigo-400" />
          <span>Internal Staff Accounts</span>
        </button>

        <button
          onClick={() => setRbacTab('roles')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'roles' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4 text-amber-400" />
          <span>System Roles & Responsibilities</span>
        </button>

        <button
          onClick={() => setRbacTab('permissions')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'permissions' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="h-4 w-4 text-emerald-400" />
          <span>Permissions Catalog</span>
        </button>
      </div>

      {/* 1. USER MANAGEMENT TAB */}
      {rbacTab === 'users' && (() => {
        // Separate business accounts (Breeder, Farm Owner, Customer, Sourcing Company) from Internal System Operation Accounts
        const isBusinessAccount = (u: UserRoleItem) => {
          const lvl = (u.userLevel || '').toLowerCase();
          const r = (u.role || '').toLowerCase();
          return (
            lvl.includes('breeder') ||
            lvl.includes('farm owner') ||
            lvl.includes('customer') ||
            lvl.includes('sire sourcing') ||
            r.includes('cow owner') ||
            Boolean(u.breederId || u.farmId || u.sourcingCompanyId)
          ) && !lvl.includes('super admin');
        };

        const businessUsers = (settings.users || []).filter(isBusinessAccount);
        const internalOperationUsers = (settings.users || []).filter(u => !isBusinessAccount(u));

        return (
          <div className="space-y-4">
            {/* ── Business Account Management notice ───────────────── */}
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs">
              <ShieldCheck className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-black text-indigo-900">
                  User Management is strictly for Internal System Operation Accounts (Staff & Administrators).
                </p>
                <p className="text-indigo-700 font-medium mt-0.5">
                  Business accounts (<strong>Breeders</strong>, <strong>Farm Stations</strong>, <strong>Sire Sourcing Companies</strong>, and <strong>Customers</strong>) are managed exclusively through their respective business functions under <strong>Account Management</strong> in the sidebar.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a
                    href="/breeders"
                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Breeder Management →
                  </a>
                  <a
                    href="/farms"
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Farm Stations →
                  </a>
                  <a
                    href="/customers"
                    className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Customers / Cow Owners →
                  </a>
                </div>
              </div>
            </div>

            {/* ── Internal System User Management table ─────────────── */}
            <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-5 gap-4">
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#dc5c15]" />
                    Internal System Operation Accounts ({internalOperationUsers.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Internal staff accounts operating and administering the system (e.g., <strong>System Administrator</strong>, <strong>Operations Officer</strong>, <strong>Certification Officer</strong>, <strong>Data Officer</strong>).
                  </CardDescription>
                </div>
                <button
                  onClick={() => {
                    setIsAddingUser(true);
                    setEditingUserId(null);
                    setUserName('');
                    setUserEmail('');
                    setUserPassword('');
                    setUserLevel('System Administrator');
                    setUserRole('System Administrator');
                    setUserDataScope('GLOBAL');
                    setUserPermissions(ALL_PERMISSIONS);
                    setUserFarmLocation('');
                    setUserCompanyName('');
                  }}
                  className="bg-[#dc5c15] hover:bg-[#c44f0e] text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#dc5c15]/20 transition-all cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Internal Account
                </button>
              </CardHeader>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50">
                        <th className="py-3 pl-3">Employee / Staff Name</th>
                        <th className="py-3">User Level (Access Template)</th>
                        <th className="py-3">Assigned Role</th>
                        <th className="py-3">Data Scope</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {internalOperationUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold text-xs">
                            No internal operation accounts configured yet. Click &quot;Create Internal Account&quot; to add staff.
                          </td>
                        </tr>
                      )}
                      {internalOperationUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pl-3">
                            <p className="font-black text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                          </td>
                          <td className="py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                              {user.userLevel || user.role || 'Internal Staff'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-slate-800">{user.role}</span>
                          </td>
                          <td className="py-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700">
                              {user.dataScope || 'GLOBAL'}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                                user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {user.status}
                            </button>
                          </td>
                          <td className="py-3 text-right pr-3 space-x-1">
                            <button
                              onClick={() => setSelectedUserForDetails(user)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Access Details
                            </button>
                            <button
                              onClick={() => handleStartEditUser(user)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* 2. USER LEVELS TAB */}
      {rbacTab === 'levels' && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Approved Operational User Levels (Account Category)</h4>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            User Level defines <strong className="text-slate-900">WHO THE USER IS</strong> in the business domain. Permissions are not assigned directly to User Levels; they are derived from Roles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentUserLevels.map(lvl => (
              <div key={lvl.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{lvl.name}</span>
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{lvl.status}</span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">{lvl.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">ID: {lvl.id}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. ROLES CONFIGURATION TAB */}
      {rbacTab === 'roles' && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#dc5c15]" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configurable System Roles (Responsibilities)</h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Roles define <strong className="text-slate-900">WHAT RESPONSIBILITY THE USER HAS</strong>. Permissions are assigned strictly to Roles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {currentRoles.map(role => (
              <div key={role.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{role.name}</span>
                    <span className="text-[8.5px] font-black bg-orange-100 text-[#dc5c15] px-1.5 py-0.2 rounded">{role.category || 'General'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{role.description}</p>
                </div>
                <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>{role.permissions.length} Permissions</span>
                  <span className="text-[#dc5c15]">System Role</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. PERMISSIONS MATRIX TAB */}
      {rbacTab === 'permissions' && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Granular Module Permissions Matrix</h4>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Permissions define <strong className="text-slate-900">WHAT ACTION A USER CAN EXECUTE</strong> (View, Create, Edit, Delete, Verify, Approve, Download).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERMISSION_MODULES.map(mod => (
              <div key={mod.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <h5 className="text-xs font-black text-slate-900 border-b border-slate-200/70 pb-1.5">{mod.label}</h5>
                <div className="space-y-1.5">
                  {mod.items.map(item => (
                    <div key={item.key} className="flex items-start gap-2 text-xs">
                      <span className="font-mono font-bold text-[10px] text-[#dc5c15] bg-orange-50 px-1.5 py-0.5 rounded shrink-0">{item.key}</span>
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. USER ACCESS MATRIX TAB */}
      {rbacTab === 'access' && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="h-4 w-4 text-[#dc5c15]" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">User Access & Data Scope Assignment</h4>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Combines <strong className="text-[#dc5c15]">User Level</strong> + <strong className="text-purple-700">Role</strong> + <strong className="text-emerald-700">Data Scope</strong> (`GLOBAL`, `FARM`, `CUSTOMER`, `SOURCING_COMPANY`, `ASSIGNED_RECORD`).
          </p>

          <div className="space-y-3">
            {(settings.users || []).map(usr => (
              <div key={usr.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-black text-slate-900">{usr.name} ({usr.email})</h5>
                  <p className="text-slate-600 font-medium mt-0.5">
                    User Level: <span className="font-bold text-[#dc5c15]">{usr.userLevel || 'Breeder'}</span> • Role: <span className="font-bold text-purple-700">{usr.role}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black bg-slate-900 text-white px-3 py-1 rounded-xl">
                    SCOPE: {usr.dataScope || 'ASSIGNED_RECORD'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add / Edit Internal User Dialog Modal */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              {editingUserId ? `Edit Internal Account: ${userName}` : 'Create Internal System Operation Account'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Internal operation accounts are for staff administering the system. Select an active User Level to automatically inherit permissions.
            </DialogDescription>
          </DialogHeader>

          {/* Educational Callout: User Level vs Record Data Scope */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5 mt-2">
            <div className="flex items-center gap-2 font-black text-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Understanding Access Configuration</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-indigo-700 block mb-0.5">1. User Level (Function Access)</span>
                Determines <em>WHAT actions</em> this staff member can execute (e.g. View Sire, Create Dam, Approve Certification).
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-amber-700 block mb-0.5">2. Record Data Scope (Visibility)</span>
                Determines <em>WHICH database records</em> this staff member can access (e.g. Global System Records vs Farm-Only).
              </div>
            </div>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dara Kim"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username / Email <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="staff@snrfarm.com"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+855 12 345 678"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Operational Unit</label>
                <select
                  value={userDepartment}
                  onChange={e => setUserDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Operations">Operations & Field Management</option>
                  <option value="Certification & Herdbook">Certification & Herdbook Registry</option>
                  <option value="Livestock & Breeding">Livestock & Breeding Operations</option>
                  <option value="Finance & Costing">Finance & Costing</option>
                  <option value="System IT & Administration">System IT & Administration</option>
                </select>
              </div>

              <div>
                {(() => {
                  const activeSystemLevels = currentUserLevels.filter(lvl => lvl.status === 'Active' && (lvl.levelType === 'SYSTEM_ACCOUNT' || !['LEVEL-01', 'LEVEL-02', 'LEVEL-03', 'LEVEL-04'].includes(lvl.id)));
                  const selectedLevelObj = activeSystemLevels.find(l => l.name === userLevel || l.id === userLevel) || activeSystemLevels[0];

                  return (
                    <>
                      <label className="block font-bold text-slate-700 mb-1">
                        System Account Level (Access Template) <span className="text-rose-500">*</span>
                      </label>

                      {activeSystemLevels.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold">
                          ⚠️ No active System Account Levels available. Please create and activate a System Account Level in User Level Management.
                        </div>
                      ) : (
                        <select
                          value={userLevel}
                          onChange={e => {
                            const val = e.target.value;
                            setUserLevel(val);
                            if (val.includes('Super Admin')) {
                              setUserDataScope('GLOBAL');
                            } else if (val.includes('Farm')) {
                              setUserDataScope('FARM');
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          {activeSystemLevels.map(lvl => (
                            <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                          ))}
                        </select>
                      )}

                      {selectedLevelObj && (
                        <div className="mt-2.5 p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-purple-900 flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-purple-600" />
                              {selectedLevelObj.name}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                              {selectedLevelObj.id}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {selectedLevelObj.description}
                          </p>
                          {(selectedLevelObj as any).purpose && (
                            <p className="text-[11px] text-indigo-700 font-semibold italic">
                              Scope/Purpose: {(selectedLevelObj as any).purpose}
                            </p>
                          )}
                          <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-[10.5px] font-bold text-purple-900">
                            <span>Automatic Access Inheritance:</span>
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                              Configured in User Level Management
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Record-Level Data Scope</label>
                <select
                  value={userDataScope}
                  onChange={e => setUserDataScope(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="GLOBAL">🌐 GLOBAL — All System Records (Super Admin / Management)</option>
                  <option value="FARM">🏡 FARM — Restricted to Authorized Farm Station Records Only</option>
                  <option value="ASSIGNED_RECORD">📋 ASSIGNED_RECORD — Restricted Strictly to Assigned Operations</option>
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Determines which specific database rows this staff member can view/edit.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={userStatus}
                  onChange={e => setUserStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Active">🟢 Active (Authorized to log in)</option>
                  <option value="Pending">🟡 Pending (Awaiting activation)</option>
                  <option value="Inactive">⚪ Inactive (Deactivated account)</option>
                  <option value="Suspended">🔴 Suspended (Temporarily blocked)</option>
                  <option value="Disabled">⛔ Disabled (Permanently blocked)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  placeholder={editingUserId ? "Leave blank to keep current password" : "Enter initial account password"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="px-4 py-2 font-bold text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-xl shadow-md transition-colors"
              >
                💾 Save Internal Account
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Access Details Modal */}
      {selectedUserForDetails && (
        <UserAccessDetailsModal
          user={selectedUserForDetails}
          callerUserId={currentUser?.id}
          isSuperAdmin={currentUser?.role === 'Super Admin' || currentUser?.role === 'Super Administrator'}
          isOpen={!!selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
          }}
        />
      )}

    </div>
  );
}
