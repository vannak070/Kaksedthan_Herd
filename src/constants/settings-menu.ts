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
  { href: '/settings/users', label: '1. Internal Operation Accounts', icon: UserCheck, description: 'Manage staff operation accounts, credentials, and user levels' },
  { href: '/settings/user-levels', label: '2. User Level Templates', icon: Layers, description: 'Configure User Levels, CRUD permission matrices, and module access' },
  { href: '/settings/breeding', label: '3. Breeding & Costing Setup', icon: Heart, description: 'AI methods, gestation timetable (+21d PD, +283d calving), USD costing rules' },
  { href: '/settings/herdbook', label: '4. Herdbook & Master Breeds', icon: BookOpen, description: 'Master breed catalog, registry numbering, classification & pedigree rules' },
  { href: '/settings/certificate', label: '5. Certificate & Dynamic QR', icon: Award, description: 'A4 Landscape templates, QR verification tokens & public access' },
  { href: '/settings/organization', label: '6. Stock & Sourcing Setup', icon: Building2, description: 'Semen straw stock rules, Sourcing Company register & farm locations' },
  { href: '/settings/audit-logs', label: '7. Audit & Security Logs', icon: Shield, description: 'Security audit trail & system configuration changes' }
];
