'use client';

import React, { useState } from 'react';
import { 
  Database, 
  DollarSign, 
  Scale, 
  LogOut, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Heart, 
  Settings, 
  PieChart, 
  LayoutDashboard,
  Menu,
  X,
  Building,
  ChevronRight,
  Beef,
  Syringe,
  Package,
  Plus,
  Sparkles,
  Baby,
  Award,
  FileText
} from 'lucide-react';
import { StockItem } from '@/lib/xlsx-parser';
import { UserRoleItem } from '@/lib/types';
import { hasPermission, format2Decimals, format2DecimalsWithCommas } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

export type ActiveTabType = 
  | 'dashboard' 
  | 'fattening'
  | 'breeding'
  | 'breeding-semen'
  | 'dam-listing'
  | 'calf-listing'
  | 'calf-certificate'
  | 'calves'
  | 'calf'
  | 'calf-management'
  | 'certificate-center'
  | 'breeding-logs'
  | 'gestation-calendar'
  | 'breeding-financials'
  | 'breeding-analytics'
  | 'breeding-setup'
  | 'cow-inventory' 
  | 'batch-management' 
  | 'feed-inventory'
  | 'health-tracking' 
  | 'weight-tracking' 
  | 'sales-finance' 
  | 'analytics' 
  | 'settings'
  | 'farms';

interface SidebarLayoutProps {
  children: React.ReactNode;
  stock: StockItem[];
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenQuickEntry: () => void;
  healthAlertsCount: number;
  vaccineAlertsCount: number;
  currentUser?: UserRoleItem | null;
  onLogout?: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number | string | null;
  badgeColor?: 'amber' | 'rose' | 'emerald';
  isSubItem?: boolean;
}

function NavItem({ icon, label, isActive, onClick, badge, badgeColor = 'amber', isSubItem = false }: NavItemProps) {
  const badgeColors = {
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    emerald: 'bg-emerald-500 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between transition-all duration-200 cursor-pointer ${
        isSubItem ? 'pl-6 pr-3 py-2 text-xs rounded-lg' : 'px-3.5 py-2.5 rounded-xl text-sm font-semibold'
      } ${
        isActive
          ? 'bg-gradient-to-r from-[#dc5c15] to-[#f37d4f] text-white font-bold shadow-md shadow-[#dc5c15]/20 border border-orange-400/30 translate-x-1'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:translate-x-0.5'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#dc5c15]'}`}>
          {icon}
        </span>
        <span className={`${isSubItem ? 'text-[12px] font-semibold' : 'text-[13px] font-bold'} leading-none tracking-wide`}>{label}</span>
      </span>
      <span className="flex items-center gap-2">
        {badge ? (
          <span className={`inline-flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full text-[9px] font-black ${badgeColors[badgeColor]} animate-pulse`}>
            {badge}
          </span>
        ) : isActive ? (
          <ChevronRight className="h-3.5 w-3.5 text-white/80" />
        ) : null}
      </span>
    </button>
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
  stock,
  activeTab,
  setActiveTab,
  onOpenQuickEntry,
  healthAlertsCount,
  vaccineAlertsCount,
  currentUser,
  onLogout,
}: SidebarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const activeStock = stock.filter(item => item.status.toLowerCase() === 'active');
  const totalHead = activeStock.length;
  const totalWeight = activeStock.reduce((sum, item) => sum + (item.weight || 0), 0);
  const averageWeight = totalHead > 0 ? format2Decimals(totalWeight / totalHead) : '0.00';
  const inventoryValue = activeStock.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAlerts = healthAlertsCount + vaccineAlertsCount;

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-[#dc5c15]/10 text-[#dc5c15] border-[#dc5c15]/30',
    'Admin': 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    'Farm Manager': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
    'Veterinarian': 'bg-rose-500/10 text-rose-700 border-rose-500/30',
  };
  const roleBadgeClass = roleColors[currentUser?.role || ''] || 'bg-slate-500/10 text-slate-700 border-slate-500/30';

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 text-slate-800 shadow-xs">

      {/* ─── Logo Header ─── */}
      <div className="flex items-center justify-between h-[76px] px-5 bg-slate-50/70 border-b border-slate-200/70 flex-shrink-0 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#dc5c15]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 p-1 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="/logo.png" alt="KAKSEDTHAN Logo" className="h-full w-full object-contain filter drop-shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-slate-900 font-black text-sm tracking-wider leading-none">KAKSEDTHAN</p>
              <span className="text-[8px] font-black bg-[#dc5c15] text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-xs">ERP</span>
            </div>
            <p className="text-[#dc5c15] text-[9px] font-black tracking-[0.14em] uppercase mt-1">Livestock System</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>



      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">

        {/* Overview */}
        <NavSection label="Overview">
          <NavItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            label={t('nav.dashboard')}
            isActive={activeTab === 'dashboard'}
            onClick={() => handleTabChange('dashboard')}
          />
        </NavSection>

        {/* Breeding Operations */}
        <NavSection label="Breeding Operations">
          <NavItem
            icon={<Heart className="h-4 w-4 text-[#dc5c15]" />}
            label="Breeding Program"
            isActive={activeTab === 'breeding' || activeTab === 'breeding-logs'}
            onClick={() => handleTabChange('breeding-logs')}
            isSubItem={true}
          />
          <NavItem
            icon={<Syringe className="h-4 w-4 text-purple-600" />}
            label="Stock Insemination"
            isActive={activeTab === 'breeding-semen'}
            onClick={() => handleTabChange('breeding-semen')}
            isSubItem={true}
          />
          <NavItem
            icon={<Beef className="h-4 w-4 text-purple-600" />}
            label="Dam Listing"
            isActive={activeTab === 'dam-listing'}
            onClick={() => handleTabChange('dam-listing')}
            isSubItem={true}
          />
          <NavItem
            icon={<Baby className="h-4 w-4 text-purple-600" />}
            label="Calf Management"
            isActive={activeTab === 'calf-listing' || activeTab === 'calf-certificate'}
            onClick={() => handleTabChange('calf-listing')}
            isSubItem={true}
          />
          <NavItem
            icon={<Calendar className="h-4 w-4 text-purple-600" />}
            label="Calendar"
            isActive={activeTab === 'gestation-calendar'}
            onClick={() => handleTabChange('gestation-calendar')}
            isSubItem={true}
          />
          <NavItem
            icon={<PieChart className="h-4 w-4 text-purple-600" />}
            label="Financial & Analytics"
            isActive={activeTab === 'breeding-financials' || activeTab === 'breeding-analytics'}
            onClick={() => handleTabChange('breeding-financials')}
            isSubItem={true}
          />
        </NavSection>

        {/* Fattening Operations */}
        {(hasPermission(currentUser, 'stock_view') ||
          hasPermission(currentUser, 'batch_view') ||
          hasPermission(currentUser, 'health_view')) && (
          <NavSection label="Fattening Operations">
            <NavItem
              icon={<Beef className="h-4 w-4" />}
              label="Fattening Management"
              isActive={activeTab === 'fattening'}
              onClick={() => handleTabChange('fattening')}
            />
            {hasPermission(currentUser, 'stock_view') && (
              <NavItem
                icon={<Beef className="h-4 w-4 text-[#dc5c15]" />}
                label={t('nav.cattleRegistry')}
                isActive={activeTab === 'cow-inventory'}
                onClick={() => handleTabChange('cow-inventory')}
              />
            )}
            {hasPermission(currentUser, 'batch_view') && (
              <NavItem
                icon={<TrendingUp className="h-4 w-4" />}
                label={t('nav.batchManagement')}
                isActive={activeTab === 'batch-management'}
                onClick={() => handleTabChange('batch-management')}
              />
            )}
            <NavItem
              icon={<Scale className="h-4 w-4" />}
              label={t('nav.weightTracking')}
              isActive={activeTab === 'weight-tracking'}
              onClick={() => handleTabChange('weight-tracking')}
            />
            <NavItem
              icon={<Package className="h-4 w-4" />}
              label={t('nav.feedStock')}
              isActive={activeTab === 'feed-inventory'}
              onClick={() => handleTabChange('feed-inventory')}
            />
            {hasPermission(currentUser, 'health_view') && (
              <NavItem
                icon={<Syringe className="h-4 w-4" />}
                label={t('nav.healthLogs')}
                isActive={activeTab === 'health-tracking'}
                onClick={() => handleTabChange('health-tracking')}
                badge={totalAlerts > 0 ? totalAlerts : null}
                badgeColor="rose"
              />
            )}
          </NavSection>
        )}

        {/* Financials & Analytics */}
        {(hasPermission(currentUser, 'sales_view') ||
          hasPermission(currentUser, 'analytics_view')) && (
          <NavSection label="Finance & Analytics">
            {hasPermission(currentUser, 'sales_view') && (
              <NavItem
                icon={<DollarSign className="h-4 w-4" />}
                label={t('nav.salesFinance')}
                isActive={activeTab === 'sales-finance'}
                onClick={() => handleTabChange('sales-finance')}
              />
            )}
            {hasPermission(currentUser, 'analytics_view') && (
              <NavItem
                icon={<PieChart className="h-4 w-4" />}
                label={t('nav.analytics')}
                isActive={activeTab === 'analytics'}
                onClick={() => handleTabChange('analytics')}
              />
            )}
          </NavSection>
        )}

        {/* Administration */}
        {hasPermission(currentUser, 'settings_manage') && (
          <NavSection label="Administration">
            <NavItem
              icon={<Building className="h-4 w-4" />}
              label={t('nav.farmLocations')}
              isActive={activeTab === 'farms'}
              onClick={() => handleTabChange('farms')}
            />
            <NavItem
              icon={<Settings className="h-4 w-4" />}
              label={t('nav.masterSettings')}
              isActive={activeTab === 'settings'}
              onClick={() => handleTabChange('settings')}
            />
          </NavSection>
        )}
      </nav>

      {/* ─── User Profile Footer ─── */}
      {currentUser && (
        <div className="flex-shrink-0 mx-3 mb-3.5 mt-1 border-t border-slate-200/80 pt-3">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-2.5 hover:bg-slate-100/80 border border-slate-200/80 transition-all">
            {/* Avatar with Status Dot */}
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#dc5c15] to-[#c44f0e] flex items-center justify-center font-black text-xs text-white shadow-md shadow-[#dc5c15]/20">
                {userInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-900 truncate leading-tight">{currentUser.name}</p>
              <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md border mt-1 ${roleBadgeClass}`}>
                {currentUser.role}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-2 rounded-xl hover:bg-rose-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* Desktop Navigation Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col shadow-2xl shadow-slate-900/30 z-30">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
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

      {/* Main App Content */}
      <main className="flex-1 flex flex-col bg-slate-50/90 min-w-0 overflow-y-auto">

        {/* Top Header Bar (Rendered only for Dashboard view) */}
        {activeTab === 'dashboard' ? (
          <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-3.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight flex items-center gap-2">
                    <span>{t('nav.systemTitle')}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#dc5c15]/10 text-[#dc5c15] border border-[#dc5c15]/20">
                      <Sparkles className="h-3 w-3" />
                      LIVE
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {t('nav.systemSubtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <div className="hidden lg:flex text-xs text-slate-600 font-bold bg-slate-100/80 py-2 px-3.5 rounded-full border border-slate-200/80 items-center gap-2 shadow-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#dc5c15]" />
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-orange-50/90 to-amber-50/50 border border-[#dc5c15]/20 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{t('dashboard.totalHerd')}</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 leading-none">{totalHead}<span className="text-[10px] text-[#dc5c15] font-extrabold ml-1">head</span></h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#dc5c15] to-[#c44f0e] text-white flex items-center justify-center shadow-md shadow-[#dc5c15]/20 flex-shrink-0">
                  <Database className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-100/90 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{t('dashboard.avgWeight')}</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 leading-none">{averageWeight}<span className="text-[10px] text-blue-600 font-extrabold ml-1">kg</span></h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                  <Scale className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50/90 to-yellow-50/50 border border-amber-100/90 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{t('dashboard.assetValue')}</p>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 leading-none truncate">៛ {format2DecimalsWithCommas(inventoryValue)}</h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>

              <div className={`border rounded-2xl p-3 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow ${
                healthAlertsCount > 0 ? 'bg-rose-50/90 border-rose-200' : 'bg-emerald-50/90 border-emerald-100'
              }`}>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Health Status</p>
                  <h3 className={`text-xs sm:text-sm font-black mt-0.5 leading-none ${healthAlertsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {healthAlertsCount > 0 ? `${healthAlertsCount} Alerts` : '✓ All Stable'}
                  </h3>
                </div>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-white ${
                  healthAlertsCount > 0 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
                }`}>
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </div>
          </header>
        ) : (
          <header className="md:hidden border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-2.5 sticky top-0 z-20 shadow-xs flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <LanguageSwitcher />
          </header>
        )}

        {/* Page Content */}
        <div className="p-4 sm:p-6 flex-1 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
