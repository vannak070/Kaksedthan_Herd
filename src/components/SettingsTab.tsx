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
      { id: '1', name: 'Vannak Admin', email: 'vannak@snrfarm.com', userLevel: 'Breeder', role: 'Super Admin', dataScope: 'GLOBAL', status: 'Active', permissions: ALL_PERMISSIONS },
      { id: '2', name: 'Dr. Vannak Breeder', email: 'breeder@snrfarm.com', userLevel: 'Breeder', role: 'Breeding Specialist', dataScope: 'ASSIGNED_RECORD', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] },
      { id: '3', name: 'Bona Farm Owner', email: 'bona.v@snrfarm.com', userLevel: 'Farm Owner', role: 'Farm Manager', dataScope: 'FARM', farmLocation: 'រទាំង', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] },
      { id: '4', name: 'Sophea Cow Owner', email: 'sophea@customer.com', userLevel: 'Customer / Cow Owner', role: 'Customer Viewer', dataScope: 'CUSTOMER', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] },
      { id: '5', name: 'ABS Global Sourcing Co.', email: 'sourcing@absglobal.com', userLevel: 'Sire Sourcing Company', role: 'Sourcing Manager', dataScope: 'SOURCING_COMPANY', companyName: 'ABS Global', status: 'Active', permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'] }
    ],
    roles: APPROVED_ROLES,
    userLevels: APPROVED_USER_LEVELS
  };

  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'livestock' | 'breeding' | 'users'>('users');
  const [rbacTab, setRbacTab] = useState<'users' | 'levels' | 'roles' | 'permissions' | 'access'>('users');

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
  const [userLevel, setUserLevel] = useState<string>('Breeder');
  const [userRole, setUserRole] = useState<string>('Breeding Specialist');
  const [userDataScope, setUserDataScope] = useState<DataScopeType>('ASSIGNED_RECORD');
  const [userPermissions, setUserPermissions] = useState<PermissionKey[]>(DEFAULT_ROLE_PERMISSIONS['Breeder'] || []);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFarmLocation, setUserFarmLocation] = useState<string>('');
  const [userCompanyName, setUserCompanyName] = useState<string>('');

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
    setUserPassword(user.password || '');
    setUserLevel(user.userLevel || 'Breeder');
    setUserRole(user.role);
    setUserDataScope(user.dataScope || 'ASSIGNED_RECORD');
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
            userLevel: userLevel as any,
            role: userRole,
            dataScope: userDataScope,
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
        userLevel: userLevel as any,
        role: userRole,
        dataScope: userDataScope,
        status: 'Active',
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
    setUserPassword('');
    setUserLevel('Breeder');
    setUserRole('Breeding Specialist');
    setUserDataScope('ASSIGNED_RECORD');
    setUserPermissions(DEFAULT_ROLE_PERMISSIONS['Breeder']);
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
      <div className="bg-[#121926] text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#dc5c15]/20 text-[#dc5c15] border border-[#dc5c15]/30 flex items-center justify-center font-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Kaksedthan Setup & Access Control Hub</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Three-Tier Security Architecture: <span className="text-[#dc5c15] font-bold">User Level</span> (Account Category) → <span className="text-purple-400 font-bold">Role</span> (Responsibility) → <span className="text-emerald-400 font-bold">Permissions & Data Scope</span>.
            </p>
          </div>
        </div>
      </div>

      {/* 5 ACCESS CONTROL HUB SUBTABS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setRbacTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'users' ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>1. User Management</span>
        </button>

        <button
          onClick={() => setRbacTab('levels')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'levels' ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>2. User Levels (4 Levels)</span>
        </button>

        <button
          onClick={() => setRbacTab('roles')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'roles' ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>3. Roles Configuration</span>
        </button>

        <button
          onClick={() => setRbacTab('permissions')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'permissions' ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>4. Permissions Matrix</span>
        </button>

        <button
          onClick={() => setRbacTab('access')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            rbacTab === 'access' ? 'bg-[#dc5c15] text-white shadow-md shadow-[#dc5c15]/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>5. User Access & Scopes</span>
        </button>
      </div>

      {/* 1. USER MANAGEMENT TAB */}
      {rbacTab === 'users' && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 p-5 gap-4">
            <div>
              <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#dc5c15]" />
                User Account Registry & Status Controls
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Active accounts across all four operational User Levels (`Breeder`, `Farm Owner`, `Customer`, `Sire Sourcing Co.`).
              </CardDescription>
            </div>
            <button
              onClick={() => {
                setIsAddingUser(true);
                setEditingUserId(null);
                setUserName('');
                setUserEmail('');
                setUserPassword('');
                setUserLevel('Breeder');
                setUserRole('Breeding Specialist');
                setUserDataScope('ASSIGNED_RECORD');
                setUserPermissions(DEFAULT_ROLE_PERMISSIONS['Breeder']);
              }}
              className="bg-[#dc5c15] hover:bg-[#c44f0e] text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#dc5c15]/20 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Add New System User
            </button>
          </CardHeader>
          <CardContent className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 pl-3">Employee Name</th>
                    <th className="py-3">User Level (Who)</th>
                    <th className="py-3">Role (Responsibility)</th>
                    <th className="py-3">Data Scope</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(settings.users || []).map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-3">
                        <p className="font-black text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                      </td>
                      <td className="py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-orange-100 text-[#dc5c15]">
                          {user.userLevel || 'Breeder'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-800">{user.role}</span>
                      </td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700">
                          {user.dataScope || 'ASSIGNED_RECORD'}
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
      )}

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

      {/* Add / Edit User Dialog Modal */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-3xl border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#dc5c15]" />
              {editingUserId ? `Edit User: ${userName}` : 'Configure New User Account'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Separately specify User Level (Category), Role (Responsibility), and Data Scope.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 pt-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee / User Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email / Username <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">1. User Level (Account Category)</label>
                <select
                  value={userLevel}
                  onChange={e => setUserLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-[#dc5c15] focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="Breeder">Breeder</option>
                  <option value="Farm Owner">Farm Owner</option>
                  <option value="Customer / Cow Owner">Customer / Cow Owner</option>
                  <option value="Sire Sourcing Company">Sire Sourcing Company</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">2. Assigned System Role</label>
                <select
                  value={userRole}
                  onChange={e => handleRoleSelectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  {currentRoles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">3. Record-Level Data Scope</label>
                <select
                  value={userDataScope}
                  onChange={e => setUserDataScope(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
                >
                  <option value="GLOBAL">GLOBAL (All System Records)</option>
                  <option value="FARM">FARM (Authorized Farm Station)</option>
                  <option value="CUSTOMER">CUSTOMER (Owned Cattle Only)</option>
                  <option value="SOURCING_COMPANY">SOURCING_COMPANY (Supplied Sires Only)</option>
                  <option value="ASSIGNED_RECORD">ASSIGNED_RECORD (Assigned Operations)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Password</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  placeholder="Leave blank to keep password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#dc5c15] focus:outline-none"
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
                className="bg-[#dc5c15] text-white font-black px-6 py-2 rounded-xl shadow-md hover:bg-[#c44f0e]"
              >
                💾 Save User Access Profile
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
