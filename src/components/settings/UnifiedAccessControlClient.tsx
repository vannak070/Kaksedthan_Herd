'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Layers, Shield, KeyRound, Plus, Search, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, ToggleLeft, ToggleRight, Trash2, RefreshCw, FileEdit, Activity, ShieldAlert,
  Building, UserCheck, Globe2, UserPlus, Eye, Lock, Mail, ShieldCheck, UserCheck2, HelpCircle, Edit3
} from 'lucide-react';
import { setUserLevelStatusAction, deleteUserLevelAction, updateSettingsAction, createUserAccountAction, updateUserAccountAction, deleteUserAccountAction, createUserLevelAction } from '@/app/actions';
import { UserRoleItem, UserLevelItem, CustomRoleDefinition } from '@/types/settings.types';
import UserAccessDetailsModal from './UserAccessDetailsModal';

interface LevelItem {
  id: string;
  code?: string;
  name: string;
  description: string;
  purpose?: string;
  status: 'Active' | 'Inactive' | 'Draft';
  sortOrder?: number;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UnifiedAccessControlClientProps {
  initialUsers: UserRoleItem[];
  initialLevels: LevelItem[];
  initialRoles?: CustomRoleDefinition[];
  initialTab?: 'staff' | 'levels';
}

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Disabled: 'bg-rose-50 text-rose-700 border-rose-200'
};

export default function UnifiedAccessControlClient({
  initialUsers,
  initialLevels,
  initialRoles = [],
  initialTab = 'staff'
}: UnifiedAccessControlClientProps) {
  const router = useRouter();

  // Active top tab
  const [activeTab, setActiveTab] = useState<'staff' | 'levels'>(initialTab);

  // Datasets state
  const [users, setUsers] = useState<UserRoleItem[]>(initialUsers);
  const [levels, setLevels] = useState<LevelItem[]>(initialLevels);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // User details view modal
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserRoleItem | null>(null);

  // User Level warning/confirm modal
  const [levelConfirmState, setLevelConfirmState] = useState<{
    open: boolean;
    type: 'toggle' | 'delete' | 'warning_delete';
    level?: LevelItem;
  }>({ open: false, type: 'toggle' });

  // Add / Edit User Form Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRoleItem | null>(null);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Single-page User Wizard Form State
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    role: 'Super Admin',
    userLevel: 'Super Admin Account',
    accountCategory: 'STAFF' as 'STAFF' | 'BUSINESS',
    dataScope: 'GLOBAL' as 'GLOBAL' | 'FARM' | 'CUSTOMER' | 'SOURCING_COMPANY' | 'ASSIGNED_RECORD',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending' | 'Disabled',
    farmLocation: '',
    companyName: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Filtered Lists - Exclude External Operations (Breeder, Sire Sourcing, Customer) from Internal Staff Accounts
  const staffUsers = useMemo(() => {
    return users.filter(u => {
      const lvl = (u.userLevel || '').toLowerCase();
      const r = (u.role || '').toLowerCase();
      const cat = ((u as any).accountCategory || '').toLowerCase();

      if (cat === 'external' || cat === 'breeder' || cat === 'customer' || cat === 'company') return false;

      const isExternalLevel =
        lvl.includes('breeder') ||
        lvl.includes('sire sourcing') ||
        lvl.includes('sourcing company') ||
        lvl.includes('customer') ||
        lvl.includes('cow owner') ||
        lvl.includes('farm owner') ||
        lvl.includes('farm manager') ||
        r.includes('breeder') ||
        r.includes('farm owner') ||
        r.includes('farm manager') ||
        r.includes('cow owner') ||
        r.includes('sourcing company');

      const isSuperAdmin = lvl.includes('super admin') || r.includes('super admin');
      if (isSuperAdmin) return true;

      return !isExternalLevel;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    return staffUsers.filter(u => {
      const matchesSearch =
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.userLevel || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staffUsers, search, statusFilter]);

  const filteredLevels = useMemo(() => {
    return levels.filter(l => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [levels, search, statusFilter]);

  // Open Create User Modal
  const openCreateUserModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      password: 'password123',
      role: 'Super Admin',
      userLevel: 'Super Admin Account',
      accountCategory: 'STAFF',
      dataScope: 'GLOBAL',
      status: 'Active',
      farmLocation: '',
      companyName: ''
    });
    setIsUserModalOpen(true);
  };

  // Open Edit User Modal
  const openEditUserModal = (user: UserRoleItem) => {
    setEditingUser(user);
    setShowPassword(false);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: (user as any).phone || '',
      password: '',
      role: user.role,
      userLevel: user.userLevel || 'Super Admin Account',
      accountCategory: (user as any).accountCategory || 'STAFF',
      dataScope: (user.dataScope as any) || 'GLOBAL',
      status: (user.status as any) || 'Active',
      farmLocation: user.farmLocation || '',
      companyName: user.companyName || ''
    });
    setIsUserModalOpen(true);
  };

  // Create Level Form State
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [submittingLevel, setSubmittingLevel] = useState(false);
  const [levelFormData, setLevelFormData] = useState({
    code: '',
    name: '',
    description: '',
    purpose: '',
    levelType: 'SYSTEM_ACCOUNT' as 'SYSTEM_ACCOUNT' | 'ACCOUNT_MANAGEMENT',
    sortOrder: 10
  });

  const openCreateLevelModal = () => {
    setLevelFormData({
      code: '',
      name: '',
      description: '',
      purpose: '',
      levelType: 'SYSTEM_ACCOUNT',
      sortOrder: (levels.length + 1) * 10
    });
    setIsLevelModalOpen(true);
  };

  const handleSaveLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormData.name.trim()) {
      showToast('error', 'User Level Name is required.');
      return;
    }
    const code = levelFormData.code.trim().toUpperCase() || levelFormData.name.toUpperCase().replace(/\s+/g, '_');

    setSubmittingLevel(true);
    try {
      const res = await createUserLevelAction({
        code,
        name: levelFormData.name.trim(),
        description: levelFormData.description.trim(),
        purpose: levelFormData.purpose.trim(),
        sortOrder: Number(levelFormData.sortOrder) || 10
      });

      if (res.success && res.data) {
        showToast('success', `User Level "${levelFormData.name}" created and saved to PostgreSQL database!`);
        setIsLevelModalOpen(false);
        router.refresh();
      } else {
        showToast('error', res.error || 'Failed to create user level.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create user level.');
    } finally {
      setSubmittingLevel(false);
    }
  };

  // Delete User State
  const [userConfirmState, setUserConfirmState] = useState<{
    open: boolean;
    user?: UserRoleItem;
  }>({ open: false });

  // Handle Save User (Create or Update)
  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      showToast('error', 'Name and Email address are required.');
      return;
    }

    setSubmittingUser(true);
    try {
      let res;
      if (editingUser) {
        res = await updateUserAccountAction(editingUser.id, {
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role,
          userLevel: userFormData.userLevel,
          status: userFormData.status,
          farmLocation: userFormData.farmLocation,
          companyName: userFormData.companyName
        });
      } else {
        res = await createUserAccountAction({
          name: userFormData.name,
          email: userFormData.email,
          password: userFormData.password,
          role: userFormData.role,
          userLevel: userFormData.userLevel,
          dataScope: 'GLOBAL',
          status: userFormData.status,
          farmLocation: userFormData.farmLocation,
          companyName: userFormData.companyName
        });
      }

      if (res.success) {
        showToast('success', `Internal staff account "${userFormData.name}" ${editingUser ? 'updated' : 'saved'} successfully to PostgreSQL database!`);
        setIsUserModalOpen(false);
        setUsers(prev => {
          if (editingUser) {
            return prev.map(u => u.id === editingUser.id ? { ...u, name: userFormData.name, email: userFormData.email, role: userFormData.role, userLevel: userFormData.userLevel, status: userFormData.status } : u);
          }
          return [res.data, ...prev];
        });
        router.refresh();
      } else {
        showToast('error', res.error || 'Failed to save user account.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save user account.');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (user: UserRoleItem) => {
    setLoadingId(user.id);
    try {
      const res = await deleteUserAccountAction(user.id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showToast('success', `Internal staff account "${user.name}" deleted successfully.`);
      } else {
        showToast('error', res.error || 'Failed to delete user account.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user account.');
    } finally {
      setLoadingId(null);
      setUserConfirmState({ open: false });
    }
  };

  // User Level Status Toggle & Deletion handlers
  const handleToggleLevelStatus = async (level: LevelItem) => {
    const newStatus = level.status === 'Active' ? 'Inactive' : 'Active';
    setLoadingId(level.id);
    try {
      const res = await setUserLevelStatusAction(level.id, newStatus);
      if (res.success) {
        setLevels(prev => prev.map(l => l.id === level.id ? { ...l, status: newStatus } : l));
        showToast('success', `User level ${level.name} status updated to ${newStatus}.`);
      } else {
        showToast('error', res.error || 'Failed to update level status.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update level status.');
    } finally {
      setLoadingId(null);
      setLevelConfirmState({ open: false, type: 'toggle' });
    }
  };

  const handleDeleteLevel = async (level: LevelItem) => {
    setLoadingId(level.id);
    try {
      const res = await deleteUserLevelAction(level.id);
      if (res.success) {
        setLevels(prev => prev.filter(l => l.id !== level.id));
        showToast('success', `User level ${level.name} deleted successfully.`);
      } else {
        showToast('error', res.error || 'Failed to delete user level.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user level.');
    } finally {
      setLoadingId(null);
      setLevelConfirmState({ open: false, type: 'delete' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-3 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
          'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> :
           toast.type === 'warning' ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> :
           <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          <span className="flex-1 leading-relaxed">{toast.message}</span>
          <button onClick={() => setToast(null)} className="cursor-pointer opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 text-white font-black text-xl backdrop-blur-sm">
            🛡️
          </div>
          <div>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-purple-500/30">
              Security & Identity Hub
            </span>
            <h1 className="text-xl font-black text-white mt-1">Users & Access Control Dashboard</h1>
            <p className="text-white/70 text-xs font-medium">
              Manage internal system staff accounts and account access levels cleanly without complexity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.refresh()}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {activeTab === 'levels' ? (
            <button
              onClick={openCreateLevelModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Create New User Level</span>
            </button>
          ) : (
            <button
              onClick={openCreateUserModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Create Internal Staff Account</span>
            </button>
          )}
        </div>
      </div>

      {/* DUAL NAVIGATION: 2 PROMINENT CONTENT TABS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => { setActiveTab('staff'); setSearch(''); }}
          className={`py-3 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>1. Internal Staff Accounts ({staffUsers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('levels'); setSearch(''); }}
          className={`py-3 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'levels'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>2. Account & User Levels ({levels.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'levels' ? 'Search level by name, code, description...' : 'Search user by name, email, role, level...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex-shrink-0">Filter Status:</span>
          {['All', 'Active', 'Inactive', 'Draft'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: INTERNAL STAFF ACCOUNTS TABLE */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span>Internal System Staff Accounts ({filteredUsers.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                System administrators, breeding specialists, and farm technicians with operational access.
              </p>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No staff user accounts found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">User Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-800">{u.userLevel}</td>
                      <td className="py-3 px-4">
                        {((u as any).levelStatus && (u as any).levelStatus !== 'Active') ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase bg-amber-50 text-amber-800 border-amber-300 block w-max" title="Parent User Level function status is disabled in system configuration">
                              ⚠️ Level Off (Suspended)
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-medium block">
                              Parent level is {(u as any).levelStatus}
                            </span>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${STATUS_BADGE[u.status || 'Active']}`}>
                            {u.status || 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            title="Edit User Account"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            disabled={loadingId === u.id || u.email === 'admin@kaksedthan.com' || u.email === 'vannak@snrfarm.com'}
                            onClick={() => setUserConfirmState({ open: true, user: u })}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={u.email === 'admin@kaksedthan.com' ? 'System Protected Account' : 'Delete User Account'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCOUNT & USER LEVELS */}
      {activeTab === 'levels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map(level => (
            <div key={level.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${STATUS_BADGE[level.status]}`}>
                    {level.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 text-[11px]">
                    <Users className="h-3.5 w-3.5" />
                    {level.userCount || 0} Users
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1 line-clamp-1" title={level.name}>{level.name}</h3>
                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 mb-3 inline-block">
                  {level.code}
                </span>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-2" title={level.description}>
                  {level.description}
                </p>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/user-levels/${level.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 transition-all shadow-xs flex-1 justify-center cursor-pointer"
                >
                  <span>Configure Permissions / Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    disabled={loadingId === level.id}
                    onClick={() => setLevelConfirmState({ open: true, type: 'toggle', level })}
                    className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-40 ${
                      level.status === 'Active'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={level.status === 'Active' ? 'Deactivate Level' : 'Activate Level'}
                  >
                    {level.status === 'Active' ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                  </button>

                  <button
                    disabled={loadingId === level.id || level.id === 'LEVEL-01' || level.code === 'SYSTEM_ADMIN'}
                    onClick={() => {
                      setLevelConfirmState({ open: true, type: 'delete', level });
                    }}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={level.id === 'LEVEL-01' || level.code === 'SYSTEM_ADMIN' ? 'Super Admin System Level Protected' : 'Delete User Level'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Details & Permissions Modal */}
      {selectedUserForDetails && (
        <UserAccessDetailsModal
          isOpen={true}
          user={selectedUserForDetails}
          isSuperAdmin={true}
          onClose={() => setSelectedUserForDetails(null)}
          onEdit={openEditUserModal}
        />
      )}

      {/* STREAMLINED SINGLE-PAGE USER CREATION FORM WIZARD */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingUser ? 'Edit User Account' : `Create New ${userFormData.accountCategory === 'STAFF' ? 'Internal Staff' : 'Business'} Account`}
                  </h3>
                  <p className="text-xs text-slate-500">Plain-language setup wizard with clear security scopes.</p>
                </div>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full User Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Pheourk Sokchea"
                  value={userFormData.name}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. sokchea@kaksedthan.com"
                    value={userFormData.email}
                    onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +855 12 345 678"
                    value={userFormData.phone || ''}
                    onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {userFormData.accountCategory === 'STAFF' ? 'Internal System User Level *' : 'Business Account Level *'}
                </label>
                <select
                  value={userFormData.userLevel}
                  onChange={e => {
                    const selected = e.target.value;
                    setUserFormData(prev => ({
                      ...prev,
                      userLevel: selected,
                      role: selected.replace(/ Account$/, ''),
                      dataScope: 'GLOBAL'
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50/50 font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="Super Admin Account">Super Admin Account (System Wide Root)</option>
                  {levels
                    .filter(l => (l as any).levelType === 'SYSTEM_ACCOUNT' || l.code === 'ADMIN' || (l.name || '').toLowerCase().includes('admin'))
                    .map(l => (
                      <option key={l.id} value={l.name}>
                        {l.name} ({l.code || 'SYSTEM_ACCOUNT'})
                      </option>
                    ))}
                </select>
                <p className="text-[10.5px] text-slate-400 mt-1 font-medium">
                  {userFormData.accountCategory === 'STAFF'
                    ? 'Only Internal System Account levels are selectable for staff members.'
                    : 'Only Business Account levels are selectable for external business partners.'}
                </p>
              </div>

              {/* Login Password Credentials */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-purple-600" />
                    <span>Initial Login Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10.5px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={userFormData.password}
                  onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Set login password'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required={!editingUser}
                />
                <p className="text-[10px] text-slate-500">
                  {editingUser
                    ? 'Enter a new password to update login credentials, or leave blank to preserve existing password.'
                    : <>Default login credential set to <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">password123</code>. The user can log in with their email and password immediately.</>}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {submittingUser ? 'Creating Account...' : 'Save User Account & Login Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW USER LEVEL MODAL */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Create New User Level</h3>
                  <p className="text-xs text-slate-500">Save a new system or business account level directly into PostgreSQL.</p>
                </div>
              </div>
              <button onClick={() => setIsLevelModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveLevelSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Breeding Specialist"
                    value={levelFormData.name}
                    onChange={e => {
                      const newName = e.target.value;
                      const autoCode = newName
                        .toUpperCase()
                        .replace(/[^A-Z0-9\s_]/g, '')
                        .trim()
                        .replace(/\s+/g, '_')
                        .slice(0, 24);
                      setLevelFormData(prev => ({
                        ...prev,
                        name: newName,
                        code: autoCode
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level Code / System Key</label>
                  <input
                    type="text"
                    placeholder="Auto-generated (e.g. BREEDING_SPECIALIST)"
                    value={levelFormData.code}
                    onChange={e => setLevelFormData({ ...levelFormData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                  <p className="text-[9.5px] text-slate-400 mt-1 font-medium">
                    ⚡ Auto-generated from name. Used as security identifier key in database.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Category *</label>
                <select
                  value={levelFormData.levelType}
                  onChange={e => setLevelFormData({ ...levelFormData, levelType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50/50 font-bold text-purple-900 focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="SYSTEM_ACCOUNT">Internal System Account (Staff, Technicians, Managers)</option>
                  <option value="ACCOUNT_MANAGEMENT">External Business Account (Breeders, Sourcing, Owners)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the operational responsibilities of this user level..."
                  value={levelFormData.description}
                  onChange={e => setLevelFormData({ ...levelFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLevel}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {submittingLevel ? 'Saving to Database...' : 'Save User Level to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userConfirmState.open && userConfirmState.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete internal staff account <strong className="text-slate-900">{userConfirmState.user.name}</strong> ({userConfirmState.user.email})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setUserConfirmState({ open: false })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userConfirmState.user!)}
                disabled={loadingId === userConfirmState.user.id}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Level Confirmation Modal */}
      {levelConfirmState.open && levelConfirmState.level && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {levelConfirmState.type === 'toggle'
                  ? `${levelConfirmState.level.status === 'Active' ? 'Deactivate' : 'Activate'} User Level?`
                  : 'Delete Account & User Level?'}
              </h3>
              <div className="text-xs text-slate-500 mt-1">
                {levelConfirmState.type === 'toggle' ? (
                  <p>Are you sure you want to change the status of <strong className="text-slate-900">{levelConfirmState.level.name}</strong>?</p>
                ) : (
                  <>
                    <p>Are you sure you want to permanently delete user level <strong className="text-slate-900">{levelConfirmState.level.name}</strong>?</p>
                    {(levelConfirmState.level.userCount || 0) > 0 && (
                      <p className="mt-2 font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px]">
                        ⚠️ Warning: This level is currently assigned to {levelConfirmState.level.userCount} active staff user account(s). Deleting this level will detach these accounts.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLevelConfirmState({ open: false })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (levelConfirmState.type === 'toggle') {
                    handleToggleLevelStatus(levelConfirmState.level!);
                  } else {
                    handleDeleteLevel(levelConfirmState.level!);
                  }
                }}
                disabled={loadingId === levelConfirmState.level.id}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs transition-all shadow-md ${
                  levelConfirmState.type === 'toggle' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {levelConfirmState.type === 'toggle' ? 'Confirm Status Change' : 'Confirm Delete Level'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
