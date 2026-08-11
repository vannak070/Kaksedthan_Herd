'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CRUD_MODULES, SPECIAL_PERMISSION_GROUPS, CustomRoleDefinition, PermissionKey } from '@/types/settings.types';
import { getRolesAction, createRoleAction, updateRoleAction, toggleRoleStatusAction, cloneRoleAction, deleteRoleAction } from '@/app/actions';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Search, Plus, Edit3, Copy, Power, PowerOff, Trash2, Check, X, ShieldCheck, Lock, AlertTriangle, Info, CheckSquare, Square, Shield } from 'lucide-react';

interface Props {
  initialRoles: CustomRoleDefinition[];
  callerPermissions?: string[];
}

export default function RolesManagementClient({ initialRoles, callerPermissions }: Props) {
  const [roles, setRoles] = useState<CustomRoleDefinition[]>(initialRoles);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [editingRole, setEditingRole] = useState<Partial<CustomRoleDefinition> | null>(null);
  
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const { isAdmin } = useAccessControl();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshRoles = async () => {
    try {
      const data = await getRolesAction();
      if (data) setRoles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const hasAccess = (key: string) => {
    if (isAdmin) return true;
    if (!callerPermissions) return true; // If no caller permissions passed, assume they have it (or it's handled server side)
    return callerPermissions.includes(key);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'All' || r.category === filterCat;
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [roles, search, filterCat, filterStatus]);

  const handleCreate = () => {
    setEditingRole({ name: '', category: 'System', description: '', permissions: [], status: 'Active' });
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleEdit = (r: CustomRoleDefinition) => {
    setEditingRole({ ...r });
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (r: CustomRoleDefinition) => {
    if (confirm(`Are you sure you want to ${r.status === 'Active' ? 'deactivate' : 'activate'} ${r.name}?`)) {
      try {
        await toggleRoleStatusAction(r.id);
        showToast(`Role ${r.name} status updated.`);
        refreshRoles();
      } catch (e) {
        showToast('Failed to update status', 'error');
      }
    }
  };

  const handleClone = async (r: CustomRoleDefinition) => {
    const newName = prompt(`Enter a new name for the cloned role (copied from ${r.name}):`, `${r.name} (Copy)`);
    if (newName) {
      try {
        await cloneRoleAction(r.id, newName);
        showToast(`Role cloned to ${newName}`);
        refreshRoles();
      } catch (e) {
        showToast('Failed to clone role', 'error');
      }
    }
  };

  const handleDelete = async (r: CustomRoleDefinition) => {
    if (r.isSystem) {
      showToast('Cannot delete system roles.', 'error');
      return;
    }
    if (confirm(`Are you absolutely sure you want to permanently delete the role "${r.name}"?`)) {
      try {
        await deleteRoleAction(r.id);
        showToast(`Role deleted successfully.`);
        refreshRoles();
      } catch (e) {
        showToast('Failed to delete role', 'error');
      }
    }
  };

  const saveRole = async () => {
    if (!editingRole?.name) {
      showToast('Role name is required', 'error');
      return;
    }
    try {
      if (editingRole.id) {
        await updateRoleAction(editingRole as CustomRoleDefinition);
        showToast('Role updated successfully');
      } else {
        await createRoleAction(editingRole as CustomRoleDefinition);
        showToast('Role created successfully');
      }
      setIsModalOpen(false);
      refreshRoles();
    } catch (e) {
      showToast('Failed to save role', 'error');
    }
  };

  const togglePermission = (key: PermissionKey) => {
    if (!hasAccess(key)) return;
    setEditingRole(prev => {
      if (!prev) return prev;
      const perms = prev.permissions || [];
      if (perms.includes(key)) {
        return { ...prev, permissions: perms.filter(p => p !== key) };
      } else {
        return { ...prev, permissions: [...perms, key] };
      }
    });
  };

  const setModulePermissions = (keys: PermissionKey[], enable: boolean) => {
    setEditingRole(prev => {
      if (!prev) return prev;
      let perms = [...(prev.permissions || [])];
      keys.forEach(k => {
        if (!hasAccess(k)) return;
        if (enable && !perms.includes(k)) perms.push(k);
        if (!enable && perms.includes(k)) perms = perms.filter(p => p !== k);
      });
      return { ...prev, permissions: perms };
    });
  };

  const getCatColor = (cat?: string) => {
    switch (cat) {
      case 'Breeding': return 'bg-emerald-100 text-emerald-700';
      case 'Farm': return 'bg-amber-100 text-amber-700';
      case 'Stock': return 'bg-blue-100 text-blue-700';
      case 'System': return 'bg-purple-100 text-purple-700';
      case 'Herdbook': return 'bg-orange-100 text-orange-700';
      case 'Certification': return 'bg-pink-100 text-pink-700';
      case 'Customer': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 md:p-10 relative">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-purple-300" />
            Role Management
          </h1>
          <p className="text-indigo-100 font-medium max-w-xl">
            Design and assign operational roles. Manage CRUD permissions, module access, and authority boundaries.
          </p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create Role
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search roles..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm"
          />
        </div>
        <select 
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)}
          className="bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="System">System</option>
          <option value="Breeding">Breeding</option>
          <option value="Farm">Farm</option>
          <option value="Stock">Stock</option>
          <option value="Customer">Customer</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map(role => (
          <div key={role.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getCatColor(role.category)}`}>
                {role.category}
              </div>
              <div className="flex gap-2">
                {role.isSystem && (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> System
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${role.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {role.status}
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">{role.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 flex-1 line-clamp-3">
              {role.description || 'No description provided.'}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-slate-100">
              <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                Permissions
              </span>
              <span className="text-lg font-black text-indigo-700">{role.permissions.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
              <button onClick={() => handleEdit(role)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-slate-50" title="Edit Role">
                <Edit3 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Edit</span>
              </button>
              <button onClick={() => handleClone(role)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-slate-50" title="Clone Role">
                <Copy className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Clone</span>
              </button>
              <button onClick={() => handleToggleStatus(role)} className={`flex flex-col items-center gap-1 transition-colors p-2 rounded-xl hover:bg-slate-50 ${role.status === 'Active' ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`} title={role.status === 'Active' ? 'Deactivate' : 'Activate'}>
                {role.status === 'Active' ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                <span className="text-[10px] font-bold uppercase">{role.status === 'Active' ? 'Disable' : 'Enable'}</span>
              </button>
              <button onClick={() => handleDelete(role)} disabled={role.isSystem} className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors p-2 rounded-xl hover:bg-slate-50" title={role.isSystem ? 'Cannot delete system role' : 'Delete Role'}>
                <Trash2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && editingRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-black flex items-center gap-3">
                {editingRole.id ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editingRole.id ? 'Edit Role' : 'Create Role'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center px-8 overflow-x-auto gap-4 flex-shrink-0">
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className="flex items-center gap-3 min-w-max">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${modalStep === step ? 'bg-indigo-600 text-white shadow-md' : modalStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {modalStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  <span className={`font-bold text-sm ${modalStep === step ? 'text-indigo-900' : 'text-slate-500'}`}>
                    {step === 1 ? 'Info' : step === 2 ? 'CRUD' : step === 3 ? 'Special' : step === 4 ? 'Review' : 'Save'}
                  </span>
                  {step < 5 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2 hidden md:block" />}
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
              {modalStep === 1 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
                    <input 
                      type="text" 
                      value={editingRole.name} 
                      onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                      placeholder="e.g. Senior Veterinarian"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select 
                      value={editingRole.category} 
                      onChange={e => setEditingRole({...editingRole, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="System">System</option>
                      <option value="Breeding">Breeding</option>
                      <option value="Farm">Farm</option>
                      <option value="Stock">Stock</option>
                      <option value="Customer">Customer</option>
                      <option value="Herdbook">Herdbook</option>
                      <option value="Certification">Certification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea 
                      value={editingRole.description} 
                      onChange={e => setEditingRole({...editingRole, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 h-32 resize-none"
                      placeholder="Describe the responsibilities of this role..."
                    />
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">CRUD Permissions</h3>
                    <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl">
                      {editingRole.permissions?.length || 0} Total Selected
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-bold text-slate-700">Module</th>
                          <th className="p-4 font-bold text-slate-700 text-center">View</th>
                          <th className="p-4 font-bold text-slate-700 text-center">Create</th>
                          <th className="p-4 font-bold text-slate-700 text-center">Update</th>
                          <th className="p-4 font-bold text-slate-700 text-center">Delete</th>
                          <th className="p-4 font-bold text-slate-700 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {CRUD_MODULES.map(mod => {
                          const keys = Object.values(mod.permissions).filter(Boolean) as PermissionKey[];
                          const allSelected = keys.every(k => editingRole.permissions?.includes(k));
                          
                          const renderCheckbox = (key?: PermissionKey) => {
                            if (!key) return <span className="text-slate-200">-</span>;
                            const allowed = hasAccess(key);
                            const checked = editingRole.permissions?.includes(key);
                            return (
                              <button 
                                onClick={() => togglePermission(key)}
                                disabled={!allowed}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${!allowed ? 'bg-slate-100 cursor-not-allowed' : checked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-transparent hover:bg-slate-200'}`}
                                title={!allowed ? "You don't have this permission" : ""}
                              >
                                {!allowed ? <Lock className="w-3 h-3 text-slate-400" /> : <Check className="w-4 h-4" />}
                              </button>
                            );
                          };

                          return (
                            <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                                <span className="text-xl">{mod.icon}</span> {mod.label}
                              </td>
                              <td className="p-4 text-center"><div className="flex justify-center">{renderCheckbox(mod.permissions.view)}</div></td>
                              <td className="p-4 text-center"><div className="flex justify-center">{renderCheckbox(mod.permissions.create)}</div></td>
                              <td className="p-4 text-center"><div className="flex justify-center">{renderCheckbox(mod.permissions.update)}</div></td>
                              <td className="p-4 text-center"><div className="flex justify-center">{renderCheckbox(mod.permissions.delete)}</div></td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => setModulePermissions(keys, !allSelected)}
                                  className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  {allSelected ? 'Clear All' : 'Select All'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-6">Special Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SPECIAL_PERMISSION_GROUPS.map(group => (
                      <div key={group.category} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-lg font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                          <span>{group.icon}</span> {group.category}
                        </div>
                        <div className="space-y-3">
                          {group.items.map(item => {
                            const allowed = hasAccess(item.key);
                            const checked = editingRole.permissions?.includes(item.key);
                            return (
                              <div key={item.key} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                <button 
                                  onClick={() => togglePermission(item.key)}
                                  disabled={!allowed}
                                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${!allowed ? 'bg-slate-100 cursor-not-allowed' : checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-transparent hover:bg-slate-200'}`}
                                >
                                  {!allowed ? <Lock className="w-3 h-3 text-slate-400" /> : <Check className="w-4 h-4" />}
                                </button>
                                <div>
                                  <div className="font-bold text-sm text-slate-900">{item.label}</div>
                                  <div className="text-xs text-slate-500">{item.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalStep === 4 && (
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-black text-slate-900 mb-6 text-center">Review Role Definitions</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Name</span>
                        <span className="text-lg font-black text-slate-900">{editingRole.name || 'Untitled Role'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block ${getCatColor(editingRole.category)}`}>
                          {editingRole.category}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                        <span className="text-sm font-medium text-slate-700">{editingRole.description || 'No description provided'}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-700">Selected Permissions</span>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full">
                          {editingRole.permissions?.length || 0} Total
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingRole.permissions?.length === 0 ? (
                          <div className="text-slate-400 text-sm italic">No permissions selected</div>
                        ) : (
                          editingRole.permissions?.map(p => (
                            <span key={p} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono px-2 py-1 rounded-lg">
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 5 && (
                <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">Ready to Save</h3>
                  <p className="text-slate-500 font-medium">
                    You are about to {editingRole.id ? 'update' : 'create'} the role <span className="font-bold text-slate-900">{editingRole.name}</span> with {editingRole.permissions?.length} permissions.
                  </p>
                  <button 
                    onClick={saveRole}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Confirm & Save Role
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center flex-shrink-0">
              <button 
                onClick={() => modalStep > 1 ? setModalStep(modalStep - 1) : setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                {modalStep > 1 ? 'Back' : 'Cancel'}
              </button>
              {modalStep < 5 && (
                <button 
                  onClick={() => setModalStep(modalStep + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 font-bold text-sm ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom chevron icon for stepper
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
