'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CRUD_MODULES, SPECIAL_PERMISSION_GROUPS, PermissionCatalogItem, CrudModule } from '@/types/settings.types';
import { getPermissionsAction } from '@/app/actions';
import { Search, Check, Layers, Shield, Crown, Star, ChevronRight, Lock } from 'lucide-react';

export default function PermissionsManagementClient() {
  const [permissions, setPermissions] = useState<PermissionCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const data = await getPermissionsAction();
        if (data && data.success && Array.isArray(data.data)) {
          setPermissions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const filteredPermissions = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return permissions;
    return permissions.filter(p => 
      p.key.toLowerCase().includes(s) ||
      p.label.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.module.toLowerCase().includes(s)
    );
  }, [permissions, search]);

  const crudCount = permissions.filter(p => !p.isSpecial).length;
  const specialCount = permissions.filter(p => p.isSpecial).length;
  
  const hasPermission = (key?: string) => {
    if (!key) return false;
    return filteredPermissions.some(p => p.key === key);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 sticky top-0 md:h-screen overflow-y-auto">
        <h2 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          Catalog
        </h2>
        
        <nav className="flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sections</div>
          <a href="#crud-modules" className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> CRUD Modules</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
          <a href="#special-permissions" className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Special Actions</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </nav>

        <div className="mt-auto">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stats</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total</span>
                <span className="font-bold text-slate-900">{permissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">CRUD</span>
                <span className="font-bold text-slate-900">{crudCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Special</span>
                <span className="font-bold text-slate-900">{specialCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              Permission Catalog
            </h1>
            <p className="text-slate-300 font-medium max-w-xl">
              Master registry of all available permissions in the system. Use this reference when designing roles.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by key, module, or label..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 font-medium transition-shadow"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* CRUD Modules Section */}
            <section id="crud-modules">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                CRUD Modules
              </h3>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 font-bold text-slate-700">Module</th>
                        <th className="p-4 font-bold text-slate-700 text-center">View</th>
                        <th className="p-4 font-bold text-slate-700 text-center">Create</th>
                        <th className="p-4 font-bold text-slate-700 text-center">Update</th>
                        <th className="p-4 font-bold text-slate-700 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CRUD_MODULES.filter(mod => {
                        if (!search) return true;
                        const s = search.toLowerCase();
                        return mod.label.toLowerCase().includes(s) || 
                               mod.id.toLowerCase().includes(s) ||
                               Object.values(mod.permissions).some(k => k?.toLowerCase().includes(s));
                      }).map((mod) => (
                        <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                            <span className="text-xl">{mod.icon}</span> {mod.label}
                          </td>
                          <td className="p-4 text-center">
                            {hasPermission(mod.permissions.view) ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-center">
                            {hasPermission(mod.permissions.create) ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-center">
                            {hasPermission(mod.permissions.update) ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-4 text-center">
                            {hasPermission(mod.permissions.delete) ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Special Permissions Section */}
            <section id="special-permissions">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Special Permissions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SPECIAL_PERMISSION_GROUPS.map((group) => {
                  const items = group.items.filter(item => {
                    if (!search) return true;
                    const s = search.toLowerCase();
                    return item.key.toLowerCase().includes(s) ||
                           item.label.toLowerCase().includes(s) ||
                           item.description.toLowerCase().includes(s);
                  });
                  
                  if (items.length === 0) return null;

                  return (
                    <div key={group.category} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
                        <span>{group.icon}</span>
                        {group.category}
                      </div>
                      <div className="flex flex-col gap-4">
                        {items.map(item => {
                          const permData = permissions.find(p => p.key === item.key);
                          return (
                            <div key={item.key} className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <span className="font-bold text-slate-900">{item.label}</span>
                                {permData?.isSpecial && (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Special</span>
                                )}
                              </div>
                              <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg w-fit">
                                {item.key}
                              </code>
                              <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
