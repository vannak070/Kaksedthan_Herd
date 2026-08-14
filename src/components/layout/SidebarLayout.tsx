'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LogOut, 
  Heart, 
  Settings, 
  LayoutDashboard,
  Menu,
  X,
  Building,
  ChevronRight,
  Beef,
  Syringe,
  Sparkles,
  Baby,
  Award,
  FileText,
  QrCode,
  Users,
  UserCheck,
  ClipboardList,
  Layers,
  Globe2,
  Shield,
  KeyRound,
  BookOpen,
  Sliders,
  Hash
} from 'lucide-react';
import { UserRoleItem } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAccessControl } from '@/hooks/useAccessControl';
import { getUserLevelsAction } from '@/app/actions';

interface SidebarLayoutProps {
  children: React.ReactNode;
  currentUser?: UserRoleItem | null;
  onLogout?: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

function NavItem({ icon, label, href, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`w-full group flex items-center justify-between transition-all duration-200 cursor-pointer px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
        isActive
          ? 'bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] text-white font-bold shadow-md shadow-[#dc5c15]/20 border border-orange-400/30 translate-x-1'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:translate-x-0.5'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#dc5c15]'}`}>
          {icon}
        </span>
        <span className="text-[13px] font-bold leading-none tracking-wide">{label}</span>
      </span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/80" />}
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="px-3.5 pt-2 pb-1 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#dc5c15]" />
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function SidebarLayout({
  children,
  currentUser: initialUser = null,
  onLogout,
}: SidebarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserRoleItem | null>(initialUser);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { can } = useAccessControl();

  const [inactiveLevelCodes, setInactiveLevelCodes] = useState<Set<string>>(new Set());

  // Load persisted user & role from localStorage + dynamic inactive user levels
  React.useEffect(() => {
    try {
      const rawUser = localStorage.getItem('kaksedthan_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setActiveUser(parsed);
        setSelectedRole(parsed.role || parsed.userLevel || '');
      } else {
        const savedRole = localStorage.getItem('kaksedthan_active_role');
        if (savedRole) setSelectedRole(savedRole);
      }
    } catch {}

    // Check deactivated user levels to hide corresponding nav menus
    getUserLevelsAction().then(res => {
      if (res.success && Array.isArray(res.data)) {
        const inactive = new Set<string>();
        res.data.forEach((lvl: any) => {
          if (lvl.status === 'Inactive') {
            inactive.add(lvl.code);
            inactive.add(lvl.id);
            if (lvl.name.toLowerCase().includes('sourcing') || lvl.code.includes('SOURCING')) {
              inactive.add('SIRE_SOURCING_CO');
              inactive.add('SIRE_SOURCING_COMPANY');
              inactive.add('LEVEL-05');
            }
            if (lvl.name.toLowerCase().includes('breeder') || lvl.code === 'BREEDER') {
              inactive.add('BREEDER');
              inactive.add('LEVEL-01');
            }
            if (lvl.name.toLowerCase().includes('farm') || lvl.code === 'FARM_OWNER') {
              inactive.add('FARM_OWNER');
              inactive.add('LEVEL-02');
            }
            if (lvl.name.toLowerCase().includes('customer') || lvl.name.toLowerCase().includes('owner') || lvl.code.includes('COW_OWNER')) {
              inactive.add('COW_OWNER');
              inactive.add('CUSTOMER_COW_OWNER');
              inactive.add('LEVEL-04');
            }
          }
        });
        setInactiveLevelCodes(inactive);
      }
    }).catch(() => {});
  }, [pathname]);

  const currentUser = activeUser || initialUser || { id: '0', name: 'User Account', role: selectedRole || 'Guest', email: '', status: 'Active' };
  const userRole = currentUser.role || selectedRole;

  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Super Administrator' || (currentUser as any).userLevel === 'Super Admin' || (currentUser as any).userLevel === 'Super Admin Account';
  const isAdmin = isSuperAdmin || userRole === 'Admin' || userRole === 'System Administrator' || userRole.toLowerCase().includes('admin') || (((currentUser as any).userLevel || '').toLowerCase().includes('admin'));
  const isSourcingCompany = userRole === 'Sire Sourcing Company' || userRole === 'Company' || (currentUser as any).userLevel === 'Sire Sourcing Company Account';
  const isFarmOwner = userRole === 'Farm Owner' || (currentUser as any).userLevel === 'Farm Owner Account';
  const isBreeder = userRole === 'Breeder' || userRole === 'Breeder Account' || (currentUser as any).userLevel === 'Breeder Account';
  const isFarmManager = userRole === 'Farmer / Farm Manager Account' || userRole === 'Farm Manager' || (currentUser as any).userLevel === 'Farmer / Farm Manager Account';
  const isCustomUserLevel = !isSourcingCompany && !isFarmOwner && !isBreeder && !isFarmManager;

  // Strict Route Access Security Guard: NON-ADMIN ACCOUNTS CANNOT ACCESS ADMIN ROUTES
  const isUnauthorizedRoute = React.useMemo(() => {
    if (isAdmin) return false;
    // Non-Admin (Breeder, Farm Owner, Sourcing Co, Customer, etc.) attempting to open Admin / Settings management
    if (
      pathname.startsWith('/admin/') ||
      pathname.startsWith('/settings/users') ||
      pathname.startsWith('/settings/user-levels') ||
      pathname.startsWith('/settings/roles') ||
      pathname.startsWith('/settings/permissions')
    ) {
      return true;
    }
    if (isSourcingCompany && (pathname.startsWith('/farms') || pathname.startsWith('/customers'))) {
      return true;
    }
    return false;
  }, [pathname, isAdmin, isSourcingCompany]);

  // Check logout session
  React.useEffect(() => {
    const isLoggedOut = localStorage.getItem('kaksedthan_logged_out') === 'true';
    if (isLoggedOut && pathname !== '/login' && !pathname.startsWith('/public/')) {
      router.push('/login');
      return;
    }
  }, [pathname, router]);

  // If viewing unauthenticated public verify routes or login page, render clean page without sidebar
  if (pathname.startsWith('/public/') || pathname === '/login') {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const handlePerformLogout = () => {
    localStorage.removeItem('kaksedthan_active_role');
    localStorage.removeItem('kaksedthan_user');
    localStorage.removeItem('kaksedthan_token');
    localStorage.removeItem('kaksedthan_session');
    localStorage.setItem('kaksedthan_logged_out', 'true');
    sessionStorage.clear();

    document.cookie = 'kaksedthan_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'kaksedthan_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    if (onLogout) {
      onLogout();
    }

    router.push('/login');
    window.location.href = '/login';
  };

  const handleRoleChange = (newRole: string) => {
    localStorage.removeItem('kaksedthan_logged_out');
    setSelectedRole(newRole);
    localStorage.setItem('kaksedthan_active_role', newRole);
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 text-slate-800 shadow-xs">
      {/* Logo Header */}
      <div className="flex items-center justify-between h-[76px] px-5 bg-slate-50/70 border-b border-slate-200/70 flex-shrink-0 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#dc5c15]/10 rounded-full blur-2xl pointer-events-none" />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 p-1 bg-white rounded-2xl border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
            <img src="/apple-touch-icon.png" alt="KAKSEDTHAN Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-slate-900 font-black text-sm tracking-wider leading-none">KAKSEDTHAN</p>
            <p className="text-[#dc5c15] text-[9px] font-black tracking-[0.14em] uppercase mt-1">Livestock System</p>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Dynamic User Level Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
        {/* 1. Overview Dashboard */}
        <NavSection label="Dashboard">
          <NavItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            label={t('nav.dashboard')}
            href="/"
            isActive={pathname === '/'}
          />
        </NavSection>

        {/* 2. Sire Sourcing Company Specific Navigation */}
        {isSourcingCompany && (
          <NavSection label="Sire Management">
            <NavItem
              icon={<Beef className="h-4 w-4 text-[#dc5c15]" />}
              label="Sire Register"
              href="/sires"
              isActive={pathname.startsWith('/sires')}
            />
            <NavItem
              icon={<Syringe className="h-4 w-4 text-purple-600" />}
              label="Semen Stock & Services"
              href="/stock-insemination"
              isActive={pathname.startsWith('/stock-insemination')}
            />
            <NavItem
              icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
              label="Breeding Requests"
              href="/breeding-programs"
              isActive={pathname.startsWith('/breeding-programs')}
            />
            <NavItem
              icon={<FileText className="h-4 w-4 text-emerald-600" />}
              label="Certificate Center"
              href="/certificates"
              isActive={pathname.startsWith('/certificates')}
            />
          </NavSection>
        )}

        {/* 3. Farm Owner Specific Navigation */}
        {isFarmOwner && (
          <>
            <NavSection label="My Farm">
              <NavItem
                icon={<Building className="h-4 w-4 text-amber-600" />}
                label="Farm Stations"
                href="/farms"
                isActive={pathname.startsWith('/farms')}
              />
            </NavSection>
            <NavSection label="My Animals">
              <NavItem
                icon={<Beef className="h-4 w-4 text-purple-600" />}
                label="Dam Register"
                href="/dams"
                isActive={pathname.startsWith('/dams')}
              />
              <NavItem
                icon={<Baby className="h-4 w-4 text-emerald-600" />}
                label="Calf Birth Register"
                href="/calves"
                isActive={pathname.startsWith('/calves')}
              />
              <NavItem
                icon={<Beef className="h-4 w-4 text-[#dc5c15]" />}
                label="Biological Sires"
                href="/sires"
                isActive={pathname.startsWith('/sires')}
              />
            </NavSection>
            <NavSection label="Breeding & Certification">
              <NavItem
                icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
                label="Breeding Program"
                href="/breeding-programs"
                isActive={pathname.startsWith('/breeding-programs')}
              />
              <NavItem
                icon={<FileText className="h-4 w-4 text-emerald-600" />}
                label="Certificate Center"
                href="/certificates"
                isActive={pathname.startsWith('/certificates')}
              />
            </NavSection>
          </>
        )}

        {/* 4. Farm Manager Operational Navigation */}
        {isFarmManager && (
          <>
            <NavSection label="Daily Operations">
              <NavItem
                icon={<Beef className="h-4 w-4 text-purple-600" />}
                label="Dam Register"
                href="/dams"
                isActive={pathname.startsWith('/dams')}
              />
              <NavItem
                icon={<Baby className="h-4 w-4 text-emerald-600" />}
                label="Calf Birth Register"
                href="/calves"
                isActive={pathname.startsWith('/calves')}
              />
            </NavSection>
            <NavSection label="Breeding & Certificates">
              <NavItem
                icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
                label="Breeding Program"
                href="/breeding-programs"
                isActive={pathname.startsWith('/breeding-programs')}
              />
              <NavItem
                icon={<FileText className="h-4 w-4 text-emerald-600" />}
                label="Certificate Center"
                href="/certificates"
                isActive={pathname.startsWith('/certificates')}
              />
            </NavSection>
          </>
        )}

        {/* 5. Breeder Specialist Navigation */}
        {isBreeder && (
          <>
            <NavSection label="Breeding Operations">
              <NavItem
                icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
                label="Breeding Program"
                href="/breeding-programs"
                isActive={pathname.startsWith('/breeding-programs')}
              />
              <NavItem
                icon={<Syringe className="h-4 w-4 text-purple-600" />}
                label="Stock Insemination"
                href="/stock-insemination"
                isActive={pathname.startsWith('/stock-insemination')}
              />
            </NavSection>
            <NavSection label="Herdbook & Animals">
              <NavItem
                icon={<Beef className="h-4 w-4 text-[#dc5c15]" />}
                label="Sire Register"
                href="/sires"
                isActive={pathname.startsWith('/sires')}
              />
              <NavItem
                icon={<Beef className="h-4 w-4 text-purple-600" />}
                label="Dam Register"
                href="/dams"
                isActive={pathname.startsWith('/dams')}
              />
              <NavItem
                icon={<Baby className="h-4 w-4 text-emerald-600" />}
                label="Calf Birth Register"
                href="/calves"
                isActive={pathname.startsWith('/calves')}
              />
              <NavItem
                icon={<FileText className="h-4 w-4 text-emerald-600" />}
                label="Certificate Center"
                href="/certificates"
                isActive={pathname.startsWith('/certificates')}
              />
            </NavSection>
            <NavSection label="Customers & Farms">
              <NavItem
                icon={<Users className="h-4 w-4 text-purple-600" />}
                label="Customers / Cow Owners"
                href="/customers"
                isActive={pathname.startsWith('/customers')}
              />
              <NavItem
                icon={<Building className="h-4 w-4 text-amber-600" />}
                label="Farm Stations"
                href="/farms"
                isActive={pathname.startsWith('/farms')}
              />
            </NavSection>
          </>
        )}

        {/* 6. System Administration & Custom User Level Navigation */}
        {(isAdmin || isCustomUserLevel) && (
          <>
            <NavSection label="Breeding Operations">
              <NavItem
                icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
                label="Breeding Program"
                href="/breeding-programs"
                isActive={pathname.startsWith('/breeding-programs')}
              />
              <NavItem
                icon={<Syringe className="h-4 w-4 text-purple-600" />}
                label="Stock Insemination"
                href="/stock-insemination"
                isActive={pathname.startsWith('/stock-insemination')}
              />
            </NavSection>
            <NavSection label="Herdbook System">
              {can('sire.view') && (
                <NavItem
                  icon={<Beef className="h-4 w-4 text-[#dc5c15]" />}
                  label="Sire Register"
                  href="/sires"
                  isActive={pathname.startsWith('/sires')}
                />
              )}
              {can('dam.view') && (
                <NavItem
                  icon={<Beef className="h-4 w-4 text-purple-600" />}
                  label="Dam Register"
                  href="/dams"
                  isActive={pathname.startsWith('/dams')}
                />
              )}
              {can('calf.view') && (
                <NavItem
                  icon={<Baby className="h-4 w-4 text-emerald-600" />}
                  label="Calf Birth Register"
                  href="/calves"
                  isActive={pathname.startsWith('/calves')}
                />
              )}
              {can('certification.view') && (
                <NavItem
                  icon={<FileText className="h-4 w-4 text-emerald-600" />}
                  label="Certificate Center"
                  href="/certificates"
                  isActive={pathname.startsWith('/certificates')}
                />
              )}
            </NavSection>
            <NavSection label="Account Management">
              {!inactiveLevelCodes.has('SIRE_SOURCING_CO') && !inactiveLevelCodes.has('SIRE_SOURCING_COMPANY') && !inactiveLevelCodes.has('LEVEL-05') && (
                <NavItem
                  icon={<Globe2 className="h-4 w-4 text-blue-500" />}
                  label="Genetics Sourcing Companies"
                  href="/sourcing-companies"
                  isActive={pathname.startsWith('/sourcing-companies')}
                />
              )}
              {!isSourcingCompany && !inactiveLevelCodes.has('BREEDER') && !inactiveLevelCodes.has('LEVEL-01') && (
                <NavItem
                  icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
                  label="Breeder Management"
                  href="/breeders"
                  isActive={pathname.startsWith('/breeders')}
                />
              )}
              {!isSourcingCompany && !inactiveLevelCodes.has('FARM_OWNER') && !inactiveLevelCodes.has('LEVEL-02') && (
                <NavItem
                  icon={<Building className="h-4 w-4 text-amber-600" />}
                  label="Farm Stations"
                  href="/farms"
                  isActive={pathname.startsWith('/farms')}
                />
              )}
              {!isSourcingCompany && !inactiveLevelCodes.has('COW_OWNER') && !inactiveLevelCodes.has('LEVEL-04') && (
                <NavItem
                  icon={<Users className="h-4 w-4 text-purple-600" />}
                  label="Customers / Cow Owners"
                  href="/customers"
                  isActive={pathname.startsWith('/customers')}
                />
              )}
            </NavSection>
            {isAdmin && (
              <NavSection label="Administration & Setup">
                <NavItem
                  icon={<Shield className="h-4 w-4 text-purple-600" />}
                  label="Users & Access Control"
                  href="/settings/users"
                  isActive={
                    pathname.startsWith('/settings/users') ||
                    pathname.startsWith('/settings/access-control') ||
                    pathname.startsWith('/admin/user-levels') ||
                    pathname.startsWith('/settings/roles') ||
                    pathname.startsWith('/settings/permissions')
                  }
                />
                <NavItem
                  icon={<Settings className="h-4 w-4 text-slate-700" />}
                  label="System Configuration"
                  href="/settings/general"
                  isActive={
                    pathname === '/settings' ||
                    pathname.startsWith('/settings/general') ||
                    pathname.startsWith('/settings/master-data') ||
                    pathname.startsWith('/settings/numbering') ||
                    pathname.startsWith('/settings/breeding') ||
                    pathname.startsWith('/settings/certificate')
                  }
                />
              </NavSection>
            )}
          </>
        )}
      </nav>

      {/* User Profile Footer */}
      {currentUser && (
        <div className="flex-shrink-0 mx-3 mb-3.5 mt-1 border-t border-slate-200/80 pt-3">

          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-2.5 border border-slate-200/80 transition-all">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#dc5c15] to-[#c44f0e] flex items-center justify-center font-black text-xs text-white shadow-md shadow-[#dc5c15]/20">
                {userInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-900 truncate leading-tight">{currentUser.name}</p>
              <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md border mt-1 bg-[#dc5c15]/10 text-[#dc5c15] border-[#dc5c15]/30">
                {selectedRole}
              </span>
            </div>
            <button
              onClick={handlePerformLogout}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer p-2 rounded-xl"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-rose-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col shadow-2xl shadow-slate-900/30 z-30">
        {navContent}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] h-full shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col bg-slate-50/90 min-w-0 overflow-y-auto">
        {/* Top Header Bar displaying Active User Level & Logout */}
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-20 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Level:</span>
              <span className="bg-[#dc5c15]/10 text-[#dc5c15] border border-[#dc5c15]/30 text-xs font-extrabold px-3 py-1 rounded-xl shadow-2xs">
                {selectedRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={handlePerformLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Logout of system"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1 min-w-0">
          {isUnauthorizedRoute ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center my-6 shadow-sm max-w-xl mx-auto">
              <div className="h-16 w-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
                <LogOut className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-1">Access Restricted</h2>
              <p className="text-xs text-slate-500 mb-6">
                Your active account level (<strong className="text-slate-900">{selectedRole}</strong>) does not have authorization to access <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-mono">{pathname}</code>.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#dc5c15] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#c44f0e] transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
