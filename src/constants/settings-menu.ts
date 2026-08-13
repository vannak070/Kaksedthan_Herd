import {
  BookOpen,
  Heart,
  Award,
  LayoutGrid,
  Users,
  Layers,
  Shield,
  KeyRound,
  Sliders,
  Hash
} from 'lucide-react';

export type SettingsCategory = 
  | 'USERS_ACCESS_CONTROL' 
  | 'SYSTEM_SETUP' 
  | 'MASTER_DATA' 
  | 'OPERATIONAL_RULES';

export interface SettingsMenuItem {
  href: string;
  label: string;
  category: SettingsCategory;
  icon: any;
  description: string;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  // ── 1. USERS & ACCESS CONTROL ──────────────────────────────────────────────
  {
    href: '/settings/users',
    label: 'User Accounts',
    category: 'USERS_ACCESS_CONTROL',
    icon: Users,
    description: 'User registration, active status toggles & role assignments'
  },
  {
    href: '/admin/user-levels',
    label: 'Account & User Levels',
    category: 'USERS_ACCESS_CONTROL',
    icon: Layers,
    description: 'Business Account Levels & Internal System Account Levels'
  },
  {
    href: '/settings/roles',
    label: 'Role Management',
    category: 'USERS_ACCESS_CONTROL',
    icon: Shield,
    description: 'Custom RBAC operational roles & permission bundling'
  },
  {
    href: '/settings/permissions',
    label: 'Permissions Catalog',
    category: 'USERS_ACCESS_CONTROL',
    icon: KeyRound,
    description: '60+ granular security action keys across system modules'
  },

  // ── 2. SYSTEM SETUP ────────────────────────────────────────────────────────
  {
    href: '/settings/general',
    label: 'General & Organization',
    category: 'SYSTEM_SETUP',
    icon: Sliders,
    description: 'Company branding, default logo, currency & timezone'
  },
  {
    href: '/settings/numbering',
    label: 'Auto Numbering Schemes',
    category: 'SYSTEM_SETUP',
    icon: Hash,
    description: 'Code prefixes for Sire, Dam, Calf, Breeding & Certificates'
  },

  // ── 3. MASTER DATA SETUP ───────────────────────────────────────────────────
  {
    href: '/settings/master-data',
    label: 'Master Data Setup',
    category: 'MASTER_DATA',
    icon: BookOpen,
    description: 'Single source of truth for Breeds, Feed, Expenses, Statuses & Weight Units'
  },

  // ── 4. OPERATIONAL & CERTIFICATION SETUP ────────────────────────────────────
  {
    href: '/settings/breeding',
    label: 'Breeding & Gestation Rules',
    category: 'OPERATIONAL_RULES',
    icon: Heart,
    description: 'Gestation timetables (+283d calving), PD check rules & AI costing'
  },
  {
    href: '/settings/certificate',
    label: 'Certificate & Dynamic QR',
    category: 'OPERATIONAL_RULES',
    icon: Award,
    description: 'A4 Landscape templates, QR verification tokens & public access'
  }
];
