import {
  Settings,
  Building2,
  Database,
  Beef,
  Heart,
  BookOpen,
  Award,
  QrCode,
  ShieldCheck,
  LayoutGrid,
  Shield,
  KeyRound,
  Layers,
  UserCheck
} from 'lucide-react';

export const SETTINGS_MENU_ITEMS = [
  { href: '/settings', label: 'Setup Overview', icon: LayoutGrid, description: 'System setup summary & configuration status' },
  { href: '/settings/user-levels', label: '1. User Level Management', icon: Layers, description: 'Manage 5 dynamic user account levels & module availability' },
  { href: '/settings/users', label: '2. User Management & Access Control', icon: ShieldCheck, description: 'User Management, Roles, Permissions & Data Scopes' },
  { href: '/settings/breeding', label: '3. Breeding & Costing Setup', icon: Heart, description: 'AI methods, gestation timetable (+21d PD, +283d calving), USD costing rules' },
  { href: '/settings/herdbook', label: '4. Herdbook & Master Breeds', icon: BookOpen, description: 'Master breed catalog, registry numbering, classification & pedigree rules' },
  { href: '/settings/certificate', label: '5. Certificate & Dynamic QR', icon: Award, description: 'A4 Landscape templates, QR verification tokens & public access' },
  { href: '/settings/organization', label: '6. Stock & Sourcing Setup', icon: Building2, description: 'Semen straw stock rules, Sourcing Company register & farm locations' },
  { href: '/settings/audit-logs', label: 'Audit & Security Logs', icon: Shield, description: 'Security audit trail & system configuration changes' }
];
