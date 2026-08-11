// ─── PERMISSION KEY UNION ─────────────────────────────────────────────────────
// Standardized format: module.action (all lowercase dot notation)
export type PermissionKey =
  // Dashboard
  | 'dashboard.view'
  // Sire Register
  | 'sire.view' | 'sire.create' | 'sire.update' | 'sire.delete' | 'sire.verify' | 'sire.download'
  // Dam Register
  | 'dam.view' | 'dam.create' | 'dam.update' | 'dam.delete' | 'dam.verify'
  // Calf Register
  | 'calf.view' | 'calf.create' | 'calf.update' | 'calf.delete' | 'calf.verify'
  // Breeding Program
  | 'breeding_program.view' | 'breeding_program.create' | 'breeding_program.update' | 'breeding_program.delete'
  | 'breeding_program.confirm' | 'breeding_program.approve'
  // Breeding Cost
  | 'breeding_cost.view' | 'breeding_cost.create' | 'breeding_cost.update'
  // Stock / Semen
  | 'stock.view' | 'stock.create' | 'stock.update' | 'stock.delete' | 'stock.transfer'
  // Farm Station
  | 'farm.view' | 'farm.create' | 'farm.update' | 'farm.delete'
  // Customer
  | 'customer.view' | 'customer.create' | 'customer.update' | 'customer.delete'
  // Herdbook
  | 'herdbook.view' | 'herdbook.verify' | 'herdbook.publish'
  // Certificate (generated document)
  | 'certificate.view' | 'certificate.generate' | 'certificate.download'
  // Certification (application process)
  | 'certification.view' | 'certification.apply' | 'certification.approve' | 'certification.reject'
  // User Management
  | 'user.view' | 'user.create' | 'user.update' | 'user.disable'
  // Role Management
  | 'role.view' | 'role.create' | 'role.update' | 'role.delete'
  // Permission Management
  | 'permission.view' | 'permission.assign'
  // Reports & Export
  | 'export.view' | 'report.view'
  // System Setup
  | 'system_setup.view' | 'system_setup.edit'
  // ─── LEGACY KEY ALIASES (backward compatibility) ──────────────────────────
  | 'dashboard_view'
  | 'SIRE.VIEW' | 'SIRE.CREATE' | 'SIRE.EDIT' | 'SIRE.DELETE' | 'SIRE.VERIFY' | 'SIRE.DOWNLOAD'
  | 'DAM.VIEW' | 'DAM.CREATE' | 'DAM.EDIT' | 'DAM.DELETE' | 'DAM.VERIFY'
  | 'CALF.VIEW' | 'CALF.CREATE' | 'CALF.EDIT' | 'CALF.DELETE' | 'CALF.VERIFY'
  | 'BREEDING_PROGRAM.VIEW' | 'BREEDING_PROGRAM.CREATE' | 'BREEDING_PROGRAM.EDIT'
  | 'BREEDING_PROGRAM.CONFIRM' | 'BREEDING_PROGRAM.APPROVE'
  | 'BREEDING_COST.VIEW' | 'BREEDING_COST.CREATE' | 'BREEDING_COST.EDIT'
  | 'STOCK.VIEW' | 'STOCK.CREATE' | 'STOCK.EDIT' | 'STOCK.TRANSFER'
  | 'HERDBOOK.VIEW' | 'HERDBOOK.VERIFY' | 'HERDBOOK.PUBLISH'
  | 'CERTIFICATE.VIEW' | 'CERTIFICATE.GENERATE' | 'CERTIFICATE.DOWNLOAD'
  | 'SYSTEM_SETUP.VIEW' | 'SYSTEM_SETUP.EDIT'
  | 'settings_manage' | 'farms_manage'
  | 'stock_view' | 'stock_create' | 'stock_edit' | 'stock_delete'
  | 'batch_view' | 'batch_create' | 'batch_edit' | 'batch_delete'
  | 'weight_view' | 'weight_record' | 'weight_delete'
  | 'health_view' | 'health_record' | 'health_delete'
  | 'sales_view' | 'sales_record' | 'sales_delete'
  | 'expenses_view' | 'expenses_record' | 'expenses_delete'
  | 'analytics_view' | 'feed_view' | 'feed_manage';

// ─── LEGACY KEY NORMALIZER ────────────────────────────────────────────────────
export function normalizePermissionKey(key: string): string {
  const map: Record<string, string> = {
    'dashboard_view': 'dashboard.view',
    'SIRE.VIEW': 'sire.view', 'SIRE.CREATE': 'sire.create', 'SIRE.EDIT': 'sire.update',
    'SIRE.DELETE': 'sire.delete', 'SIRE.VERIFY': 'sire.verify', 'SIRE.DOWNLOAD': 'sire.download',
    'DAM.VIEW': 'dam.view', 'DAM.CREATE': 'dam.create', 'DAM.EDIT': 'dam.update',
    'DAM.DELETE': 'dam.delete', 'DAM.VERIFY': 'dam.verify',
    'CALF.VIEW': 'calf.view', 'CALF.CREATE': 'calf.create', 'CALF.EDIT': 'calf.update',
    'CALF.DELETE': 'calf.delete', 'CALF.VERIFY': 'calf.verify',
    'BREEDING_PROGRAM.VIEW': 'breeding_program.view', 'BREEDING_PROGRAM.CREATE': 'breeding_program.create',
    'BREEDING_PROGRAM.EDIT': 'breeding_program.update', 'BREEDING_PROGRAM.CONFIRM': 'breeding_program.confirm',
    'BREEDING_PROGRAM.APPROVE': 'breeding_program.approve',
    'BREEDING_COST.VIEW': 'breeding_cost.view', 'BREEDING_COST.CREATE': 'breeding_cost.create',
    'BREEDING_COST.EDIT': 'breeding_cost.update',
    'STOCK.VIEW': 'stock.view', 'STOCK.CREATE': 'stock.create', 'STOCK.EDIT': 'stock.update',
    'STOCK.TRANSFER': 'stock.transfer',
    'HERDBOOK.VIEW': 'herdbook.view', 'HERDBOOK.VERIFY': 'herdbook.verify', 'HERDBOOK.PUBLISH': 'herdbook.publish',
    'CERTIFICATE.VIEW': 'certificate.view', 'CERTIFICATE.GENERATE': 'certificate.generate',
    'CERTIFICATE.DOWNLOAD': 'certificate.download',
    'SYSTEM_SETUP.VIEW': 'system_setup.view', 'SYSTEM_SETUP.EDIT': 'system_setup.edit',
    'settings_manage': 'system_setup.edit', 'farms_manage': 'farm.update',
    'analytics_view': 'report.view', 'feed_view': 'stock.view', 'feed_manage': 'stock.update',
  };
  return map[key] || key.toLowerCase();
}

// ─── PERMISSION CATALOG ITEM ──────────────────────────────────────────────────
export interface PermissionCatalogItem {
  key: PermissionKey;
  module: string;
  action: string;
  label: string;
  description: string;
  isSpecial?: boolean;
}

// ─── CRUD MODULE (for permission matrix UI) ───────────────────────────────────
export interface CrudModule {
  id: string;
  label: string;
  icon: string;
  permissions: {
    view?: PermissionKey;
    create?: PermissionKey;
    update?: PermissionKey;
    delete?: PermissionKey;
  };
  extraActions?: { key: PermissionKey; label: string }[];
}

export const CRUD_MODULES: CrudModule[] = [
  {
    id: 'sire', label: 'Sire Register', icon: '🐂',
    permissions: { view: 'sire.view', create: 'sire.create', update: 'sire.update', delete: 'sire.delete' },
    extraActions: [{ key: 'sire.verify', label: 'Verify' }, { key: 'sire.download', label: 'Download' }]
  },
  {
    id: 'dam', label: 'Dam Register', icon: '🐄',
    permissions: { view: 'dam.view', create: 'dam.create', update: 'dam.update', delete: 'dam.delete' },
    extraActions: [{ key: 'dam.verify', label: 'Verify' }]
  },
  {
    id: 'calf', label: 'Calf Register', icon: '🐮',
    permissions: { view: 'calf.view', create: 'calf.create', update: 'calf.update', delete: 'calf.delete' },
    extraActions: [{ key: 'calf.verify', label: 'Verify' }]
  },
  {
    id: 'breeding_program', label: 'Breeding Program', icon: '🧬',
    permissions: {
      view: 'breeding_program.view', create: 'breeding_program.create',
      update: 'breeding_program.update', delete: 'breeding_program.delete'
    },
    extraActions: [
      { key: 'breeding_program.confirm', label: 'Confirm AI' },
      { key: 'breeding_program.approve', label: 'Approve PD' }
    ]
  },
  {
    id: 'breeding_cost', label: 'Breeding Cost', icon: '💰',
    permissions: { view: 'breeding_cost.view', create: 'breeding_cost.create', update: 'breeding_cost.update' },
  },
  {
    id: 'stock', label: 'Stock Insemination', icon: '🧪',
    permissions: { view: 'stock.view', create: 'stock.create', update: 'stock.update', delete: 'stock.delete' },
    extraActions: [{ key: 'stock.transfer', label: 'Transfer' }]
  },
  {
    id: 'farm', label: 'Farm Station', icon: '🏡',
    permissions: { view: 'farm.view', create: 'farm.create', update: 'farm.update', delete: 'farm.delete' }
  },
  {
    id: 'customer', label: 'Customer / Cow Owner', icon: '👤',
    permissions: { view: 'customer.view', create: 'customer.create', update: 'customer.update', delete: 'customer.delete' }
  },
  {
    id: 'herdbook', label: 'Herdbook Registry', icon: '📜',
    permissions: { view: 'herdbook.view' },
    extraActions: [{ key: 'herdbook.verify', label: 'Verify' }, { key: 'herdbook.publish', label: 'Publish' }]
  },
  {
    id: 'certificate', label: 'Certificate', icon: '🏅',
    permissions: { view: 'certificate.view' },
    extraActions: [{ key: 'certificate.generate', label: 'Generate' }, { key: 'certificate.download', label: 'Download' }]
  },
];

// ─── SPECIAL (NON-CRUD) PERMISSION GROUPS ─────────────────────────────────────
export const SPECIAL_PERMISSION_GROUPS: {
  category: string;
  icon: string;
  items: { key: PermissionKey; label: string; description: string }[];
}[] = [
  {
    category: 'Certification Process', icon: '📋',
    items: [
      { key: 'certification.view', label: 'View Applications', description: 'View certification applications.' },
      { key: 'certification.apply', label: 'Apply for Certification', description: 'Submit a certification application.' },
      { key: 'certification.approve', label: 'Approve Application', description: 'Approve pending certification requests.' },
      { key: 'certification.reject', label: 'Reject Application', description: 'Reject pending certification requests.' },
    ]
  },
  {
    category: 'User Management', icon: '👥',
    items: [
      { key: 'user.view', label: 'View Users', description: 'View all system user accounts.' },
      { key: 'user.create', label: 'Create User', description: 'Create new system user accounts.' },
      { key: 'user.update', label: 'Edit User', description: 'Modify user profiles and settings.' },
      { key: 'user.disable', label: 'Disable User', description: 'Suspend or deactivate user accounts.' },
    ]
  },
  {
    category: 'Role & Permission Management', icon: '🔑',
    items: [
      { key: 'role.view', label: 'View Roles', description: 'View all system roles.' },
      { key: 'role.create', label: 'Create Role', description: 'Create new operational roles.' },
      { key: 'role.update', label: 'Edit Role', description: 'Modify existing role definitions.' },
      { key: 'role.delete', label: 'Delete / Deactivate Role', description: 'Remove or deactivate roles.' },
      { key: 'permission.view', label: 'View Permissions', description: 'View all permission keys.' },
      { key: 'permission.assign', label: 'Assign Permissions', description: 'Assign or remove permissions from roles.' },
    ]
  },
  {
    category: 'Reporting & Export', icon: '📊',
    items: [
      { key: 'dashboard.view', label: 'View Dashboard', description: 'Access KPI overview and metrics.' },
      { key: 'report.view', label: 'View Reports', description: 'Access operational reports.' },
      { key: 'export.view', label: 'Export Data', description: 'Download/export data as CSV or Excel.' },
    ]
  },
  {
    category: 'System Setup', icon: '⚙️',
    items: [
      { key: 'system_setup.view', label: 'View System Setup', description: 'Access configuration pages.' },
      { key: 'system_setup.edit', label: 'Edit System Setup', description: 'Modify configuration and master data.' },
    ]
  },
];

// ─── FULL PERMISSION CATALOG ──────────────────────────────────────────────────
export const PERMISSION_CATALOG: PermissionCatalogItem[] = [
  { key: 'dashboard.view', module: 'Dashboard', action: 'View', label: 'View Dashboard', description: 'Access KPI overview and metrics.' },
  { key: 'sire.view', module: 'Sire', action: 'View', label: 'View Sire Records', description: 'Access sire registry, pedigree, and sourcing info.' },
  { key: 'sire.create', module: 'Sire', action: 'Create', label: 'Register New Sire', description: 'Add new sire bull records.' },
  { key: 'sire.update', module: 'Sire', action: 'Update', label: 'Edit Sire Records', description: 'Update sire bloodline, image, and details.' },
  { key: 'sire.delete', module: 'Sire', action: 'Delete', label: 'Delete Sire Records', description: 'Permanently remove sire records.' },
  { key: 'sire.verify', module: 'Sire', action: 'Verify', label: 'Verify Sire Pedigree', description: 'Approve official sire pedigree credentials.', isSpecial: true },
  { key: 'sire.download', module: 'Sire', action: 'Download', label: 'Download Sire Certificate', description: 'Download PNG certificates for sires.', isSpecial: true },
  { key: 'dam.view', module: 'Dam', action: 'View', label: 'View Dam Records', description: 'Access dam cow registry and breeding status.' },
  { key: 'dam.create', module: 'Dam', action: 'Create', label: 'Register New Dam', description: 'Add new dam cow profiles.' },
  { key: 'dam.update', module: 'Dam', action: 'Update', label: 'Edit Dam Details', description: 'Update dam breeding status and information.' },
  { key: 'dam.delete', module: 'Dam', action: 'Delete', label: 'Delete Dam Records', description: 'Remove dam records.' },
  { key: 'dam.verify', module: 'Dam', action: 'Verify', label: 'Verify Dam Lineage', description: 'Approve dam pedigree status.', isSpecial: true },
  { key: 'calf.view', module: 'Calf', action: 'View', label: 'View Calf Records', description: 'Access calf birth registry and lineage.' },
  { key: 'calf.create', module: 'Calf', action: 'Create', label: 'Register Calf Birth', description: 'Record new calf births with Sire/Dam links.' },
  { key: 'calf.update', module: 'Calf', action: 'Update', label: 'Edit Calf Details', description: 'Update calf weight, health, and pedigree.' },
  { key: 'calf.delete', module: 'Calf', action: 'Delete', label: 'Delete Calf Records', description: 'Remove calf birth logs.' },
  { key: 'calf.verify', module: 'Calf', action: 'Verify', label: 'Verify Calf Birth', description: 'Approve official calf birth certificate.', isSpecial: true },
  { key: 'breeding_program.view', module: 'Breeding Program', action: 'View', label: 'View Breeding Programs', description: 'Access breeding programs.' },
  { key: 'breeding_program.create', module: 'Breeding Program', action: 'Create', label: 'Create Breeding Program', description: 'Initiate new breeding workflow.' },
  { key: 'breeding_program.update', module: 'Breeding Program', action: 'Update', label: 'Edit Breeding Program', description: 'Modify breeding details and dates.' },
  { key: 'breeding_program.delete', module: 'Breeding Program', action: 'Delete', label: 'Delete Breeding Program', description: 'Remove breeding program records.' },
  { key: 'breeding_program.confirm', module: 'Breeding Program', action: 'Confirm', label: 'Confirm AI Service', description: 'Confirm insemination execution.', isSpecial: true },
  { key: 'breeding_program.approve', module: 'Breeding Program', action: 'Approve', label: 'Approve Pregnancy Status', description: 'Confirm PD results and calving dates.', isSpecial: true },
  { key: 'breeding_cost.view', module: 'Breeding Cost', action: 'View', label: 'View Breeding Costing', description: 'Access costing breakdowns in USD.' },
  { key: 'breeding_cost.create', module: 'Breeding Cost', action: 'Create', label: 'Set Service Fees', description: 'Configure semen cost and service fees.' },
  { key: 'breeding_cost.update', module: 'Breeding Cost', action: 'Update', label: 'Override Unit Prices', description: 'Authorized override of stock straw prices.' },
  { key: 'stock.view', module: 'Stock', action: 'View', label: 'View Semen Stock', description: 'Access inventory of available semen straws.' },
  { key: 'stock.create', module: 'Stock', action: 'Create', label: 'Add Semen Stock', description: 'Add new semen batch imports.' },
  { key: 'stock.update', module: 'Stock', action: 'Update', label: 'Modify Stock', description: 'Update straw pricing and batch status.' },
  { key: 'stock.delete', module: 'Stock', action: 'Delete', label: 'Delete Stock Entry', description: 'Remove stock batch records.' },
  { key: 'stock.transfer', module: 'Stock', action: 'Transfer', label: 'Transfer Stock', description: 'Log stock usage and distribution.', isSpecial: true },
  { key: 'farm.view', module: 'Farm', action: 'View', label: 'View Farm Stations', description: 'Access farm station list and details.' },
  { key: 'farm.create', module: 'Farm', action: 'Create', label: 'Create Farm Station', description: 'Add new farm station records.' },
  { key: 'farm.update', module: 'Farm', action: 'Update', label: 'Edit Farm Station', description: 'Update farm configuration.' },
  { key: 'farm.delete', module: 'Farm', action: 'Delete', label: 'Delete Farm Station', description: 'Remove farm station records.' },
  { key: 'customer.view', module: 'Customer', action: 'View', label: 'View Customers', description: 'Access customer / cow owner records.' },
  { key: 'customer.create', module: 'Customer', action: 'Create', label: 'Create Customer', description: 'Add new customer accounts.' },
  { key: 'customer.update', module: 'Customer', action: 'Update', label: 'Edit Customer', description: 'Update customer details.' },
  { key: 'customer.delete', module: 'Customer', action: 'Delete', label: 'Delete Customer', description: 'Remove customer records.' },
  { key: 'herdbook.view', module: 'Herdbook', action: 'View', label: 'View Herdbook', description: 'Access official cattle registry.' },
  { key: 'herdbook.verify', module: 'Herdbook', action: 'Verify', label: 'Verify Herdbook Entry', description: 'Official verification of registration.', isSpecial: true },
  { key: 'herdbook.publish', module: 'Herdbook', action: 'Publish', label: 'Publish to QR Registry', description: 'Publish record for public QR scanning.', isSpecial: true },
  { key: 'certificate.view', module: 'Certificate', action: 'View', label: 'View Certificates', description: 'Access official A4 certificates.' },
  { key: 'certificate.generate', module: 'Certificate', action: 'Generate', label: 'Generate Certificate', description: 'Generate high-res PNG certificates.', isSpecial: true },
  { key: 'certificate.download', module: 'Certificate', action: 'Download', label: 'Download Certificate', description: 'Download PNG certificate images.', isSpecial: true },
  { key: 'certification.view', module: 'Certification', action: 'View', label: 'View Cert Applications', description: 'View certification applications.', isSpecial: true },
  { key: 'certification.apply', module: 'Certification', action: 'Apply', label: 'Apply for Certification', description: 'Submit a certification application.', isSpecial: true },
  { key: 'certification.approve', module: 'Certification', action: 'Approve', label: 'Approve Certification', description: 'Approve pending certification requests.', isSpecial: true },
  { key: 'certification.reject', module: 'Certification', action: 'Reject', label: 'Reject Certification', description: 'Reject pending certification requests.', isSpecial: true },
  { key: 'user.view', module: 'User', action: 'View', label: 'View Users', description: 'View all system user accounts.', isSpecial: true },
  { key: 'user.create', module: 'User', action: 'Create', label: 'Create User', description: 'Create new system user accounts.', isSpecial: true },
  { key: 'user.update', module: 'User', action: 'Update', label: 'Edit User', description: 'Modify user profiles and settings.', isSpecial: true },
  { key: 'user.disable', module: 'User', action: 'Disable', label: 'Disable User', description: 'Suspend or deactivate user accounts.', isSpecial: true },
  { key: 'role.view', module: 'Role', action: 'View', label: 'View Roles', description: 'View all system roles.', isSpecial: true },
  { key: 'role.create', module: 'Role', action: 'Create', label: 'Create Role', description: 'Create new operational roles.', isSpecial: true },
  { key: 'role.update', module: 'Role', action: 'Update', label: 'Edit Role', description: 'Modify existing role definitions.', isSpecial: true },
  { key: 'role.delete', module: 'Role', action: 'Delete', label: 'Delete / Deactivate Role', description: 'Remove or deactivate roles.', isSpecial: true },
  { key: 'permission.view', module: 'Permission', action: 'View', label: 'View Permissions', description: 'View all permission keys.', isSpecial: true },
  { key: 'permission.assign', module: 'Permission', action: 'Assign', label: 'Assign Permissions', description: 'Assign or remove permissions from roles.', isSpecial: true },
  { key: 'report.view', module: 'Report', action: 'View', label: 'View Reports', description: 'Access operational reports.', isSpecial: true },
  { key: 'export.view', module: 'Export', action: 'View', label: 'Export Data', description: 'Download or export data.', isSpecial: true },
  { key: 'system_setup.view', module: 'System', action: 'View', label: 'View System Setup', description: 'Access configuration pages.', isSpecial: true },
  { key: 'system_setup.edit', module: 'System', action: 'Edit', label: 'Edit System Setup', description: 'Modify configuration and master data.', isSpecial: true },
];

// ─── ALL STANDARD PERMISSIONS ─────────────────────────────────────────────────
export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_CATALOG.map(p => p.key);

// ─── LEGACY PERMISSION MODULES (backward compat for SettingsTab) ──────────────
export interface PermissionCategory {
  id: string;
  label: string;
  items: { key: PermissionKey; label: string; description: string }[];
}

export const PERMISSION_MODULES: PermissionCategory[] = [
  {
    id: 'dashboard', label: '📊 Dashboard Overview',
    items: [{ key: 'dashboard.view', label: 'View Dashboard', description: 'Access main KPI overview and metrics.' }]
  },
  {
    id: 'sire', label: '🐂 Sire Register Management',
    items: [
      { key: 'sire.view', label: 'View Sire Records', description: 'Access Sire registry, pedigree, and sourcing info.' },
      { key: 'sire.create', label: 'Register New Sire', description: 'Add new Sire bull records.' },
      { key: 'sire.update', label: 'Edit Sire Records', description: 'Update Sire bloodline, image, and details.' },
      { key: 'sire.delete', label: 'Delete Sire Records', description: 'Permanently remove Sire records.' },
      { key: 'sire.verify', label: 'Verify Sire Pedigree', description: 'Approve official Sire pedigree credentials.' },
      { key: 'sire.download', label: 'Download Sire Certificate', description: 'Download PNG certificates for Sires.' },
    ]
  },
  {
    id: 'dam', label: '🐄 Dam Cow Management',
    items: [
      { key: 'dam.view', label: 'View Dam Records', description: 'Access Dam cow registry and breeding status.' },
      { key: 'dam.create', label: 'Register New Dam', description: 'Add new Dam cow profiles.' },
      { key: 'dam.update', label: 'Edit Dam Details', description: 'Update Dam breeding status and information.' },
      { key: 'dam.delete', label: 'Delete Dam Records', description: 'Remove Dam records.' },
      { key: 'dam.verify', label: 'Verify Dam Lineage', description: 'Approve Dam pedigree status.' },
    ]
  },
  {
    id: 'calf', label: '🐮 Calf Birth Management',
    items: [
      { key: 'calf.view', label: 'View Calf Records', description: 'Access calf birth registry and lineage.' },
      { key: 'calf.create', label: 'Register Calf Birth', description: 'Record new calf births with Sire/Dam links.' },
      { key: 'calf.update', label: 'Edit Calf Details', description: 'Update calf weight, health, and pedigree.' },
      { key: 'calf.delete', label: 'Delete Calf Records', description: 'Remove calf birth logs.' },
      { key: 'calf.verify', label: 'Verify Calf Birth', description: 'Approve official calf birth certificate.' },
    ]
  },
  {
    id: 'breeding', label: '🧬 Breeding Program Operations',
    items: [
      { key: 'breeding_program.view', label: 'View Breeding Programs', description: 'Access 6-step guided breeding programs.' },
      { key: 'breeding_program.create', label: 'Create Breeding Program', description: 'Initiate new breeding workflow.' },
      { key: 'breeding_program.update', label: 'Edit Breeding Program', description: 'Modify breeding details and dates.' },
      { key: 'breeding_program.delete', label: 'Delete Breeding Program', description: 'Remove breeding program records.' },
      { key: 'breeding_program.confirm', label: 'Confirm Breeding Service', description: 'Confirm Insemination execution.' },
      { key: 'breeding_program.approve', label: 'Approve Pregnancy Status', description: 'Confirm PD results and calving dates.' },
      { key: 'breeding_cost.view', label: 'View Breeding Costing', description: 'Access costing breakdowns in USD.' },
      { key: 'breeding_cost.create', label: 'Set Service & Breeder Fees', description: 'Configure semen cost and service fees.' },
      { key: 'breeding_cost.update', label: 'Override Unit Prices', description: 'Authorized override of stock straw prices.' },
    ]
  },
  {
    id: 'stock', label: '🧪 Stock Insemination (Semen Straws)',
    items: [
      { key: 'stock.view', label: 'View Semen Stock', description: 'Access inventory of available semen straws.' },
      { key: 'stock.create', label: 'Add Semen Stock', description: 'Add new semen batch imports.' },
      { key: 'stock.update', label: 'Modify Stock', description: 'Update straw pricing and batch status.' },
      { key: 'stock.delete', label: 'Delete Stock Entry', description: 'Remove stock batch records.' },
      { key: 'stock.transfer', label: 'Transfer Stock', description: 'Log stock usage and distribution.' },
    ]
  },
  {
    id: 'herdbook', label: '📜 Herdbook & Certificate Center',
    items: [
      { key: 'herdbook.view', label: 'View Herdbook Registry', description: 'Access official cattle registry.' },
      { key: 'herdbook.verify', label: 'Verify Herdbook Entry', description: 'Official verification of registration.' },
      { key: 'herdbook.publish', label: 'Publish to QR Registry', description: 'Publish record for public QR scanning.' },
      { key: 'certificate.view', label: 'View Certificates', description: 'Access official A4 landscape certificates.' },
      { key: 'certificate.generate', label: 'Generate Certificate PNG', description: 'Generate high-res PNG certificates.' },
      { key: 'certificate.download', label: 'Download Certificate File', description: 'Download PNG certificate images.' },
    ]
  },
  {
    id: 'system', label: '⚙️ System Setup & Access Control',
    items: [
      { key: 'system_setup.view', label: 'View System Setup', description: 'Access configuration hubs.' },
      { key: 'system_setup.edit', label: 'Modify System Setup', description: 'Configure business rules and access.' },
      { key: 'user.view', label: 'View Users', description: 'View all system user accounts.' },
      { key: 'user.create', label: 'Create User', description: 'Create new system user accounts.' },
      { key: 'user.update', label: 'Edit User', description: 'Modify user profiles and settings.' },
      { key: 'user.disable', label: 'Disable User', description: 'Suspend or deactivate user accounts.' },
      { key: 'role.view', label: 'View Roles', description: 'View all system roles.' },
      { key: 'role.create', label: 'Create Role', description: 'Create new operational roles.' },
      { key: 'role.update', label: 'Edit Role', description: 'Modify existing role definitions.' },
      { key: 'role.delete', label: 'Delete/Deactivate Role', description: 'Remove or deactivate roles.' },
      { key: 'permission.view', label: 'View Permissions', description: 'View all permission keys.' },
      { key: 'permission.assign', label: 'Assign Permissions', description: 'Assign or remove permissions from roles.' },
      { key: 'farm.view', label: 'View Farm Stations', description: 'Access farm station list and details.' },
      { key: 'farm.create', label: 'Create Farm', description: 'Add new farm station records.' },
      { key: 'farm.update', label: 'Edit Farm', description: 'Update farm configuration.' },
      { key: 'farm.delete', label: 'Delete Farm', description: 'Remove farm station records.' },
      { key: 'customer.view', label: 'View Customers', description: 'Access customer / cow owner records.' },
      { key: 'customer.create', label: 'Create Customer', description: 'Add new customer accounts.' },
      { key: 'customer.update', label: 'Edit Customer', description: 'Update customer details.' },
      { key: 'customer.delete', label: 'Delete Customer', description: 'Remove customer records.' },
    ]
  }
];

// ─── DEFAULT ROLE PERMISSIONS (new standardized keys) ────────────────────────
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  'Super Admin': ALL_PERMISSIONS as PermissionKey[],
  'Admin': ALL_PERMISSIONS as PermissionKey[],
  'Breeder': [
    'dashboard.view', 'sire.view', 'dam.view', 'dam.create', 'dam.update',
    'calf.view', 'calf.create', 'calf.update',
    'breeding_program.view', 'breeding_program.create', 'breeding_program.update', 'breeding_program.confirm',
    'breeding_cost.view', 'breeding_cost.create', 'breeding_cost.update',
    'stock.view', 'stock.create', 'stock.update',
    'herdbook.view', 'herdbook.verify',
    'certificate.view', 'certificate.generate', 'certificate.download',
    'certification.view', 'certification.apply',
  ],
  'Farm Owner': [
    'dashboard.view', 'sire.view', 'dam.view', 'dam.create', 'dam.update',
    'calf.view', 'calf.create', 'calf.update',
    'breeding_program.view', 'breeding_program.create', 'breeding_cost.view',
    'herdbook.view', 'certificate.view', 'certificate.download',
    'farm.view', 'customer.view',
  ],
  'Customer / Cow Owner': [
    'dashboard.view', 'dam.view', 'calf.view',
    'breeding_program.view', 'breeding_cost.view',
    'herdbook.view', 'certificate.view', 'certificate.download', 'certification.view',
  ],
  'Sire Sourcing Company': [
    'dashboard.view', 'sire.view', 'sire.create', 'sire.update', 'sire.download',
    'stock.view', 'stock.create', 'stock.update', 'stock.transfer',
    'herdbook.view', 'certificate.view', 'certificate.download',
  ],
  'System Administrator': ALL_PERMISSIONS as PermissionKey[],
  'Breeding Specialist': [
    'dashboard.view', 'sire.view', 'dam.view', 'dam.create', 'dam.update',
    'calf.view', 'calf.create', 'calf.update',
    'breeding_program.view', 'breeding_program.create', 'breeding_program.update', 'breeding_program.confirm',
    'breeding_cost.view', 'breeding_cost.create', 'breeding_cost.update',
    'stock.view', 'herdbook.view', 'certificate.view', 'certificate.generate', 'certificate.download',
    'certification.view', 'certification.apply',
  ],
  'Farm Manager': [
    'dashboard.view', 'sire.view', 'dam.view', 'dam.create', 'dam.update',
    'calf.view', 'calf.create', 'calf.update',
    'breeding_program.view', 'breeding_program.create', 'breeding_cost.view',
    'farm.view', 'farm.update', 'customer.view',
    'herdbook.view', 'certificate.view', 'certificate.download',
  ],
  'Customer Viewer': [
    'dashboard.view', 'dam.view', 'calf.view',
    'breeding_program.view', 'herdbook.view', 'certificate.view', 'certificate.download',
  ],
  'Sourcing Manager': [
    'dashboard.view', 'sire.view', 'sire.create', 'sire.update', 'sire.download',
    'stock.view', 'stock.create', 'stock.update', 'stock.transfer',
    'herdbook.view', 'certificate.view', 'certificate.download',
  ],
};

// ─── USER LEVEL ───────────────────────────────────────────────────────────────
export interface UserLevelItem {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const APPROVED_USER_LEVELS: UserLevelItem[] = [
  { id: 'LEVEL-01', name: 'Breeder Account', description: 'Breeding specialist & AI operations professional managing services and programs.', status: 'Active' },
  { id: 'LEVEL-02', name: 'Farm Owner Account', description: 'Owner/manager of farm stations controlling farm animals, breeding, and costs.', status: 'Active' },
  { id: 'LEVEL-03', name: 'Farmer / Farm Manager Account', description: 'Day-to-day operational manager of an authorized farm under a Farm Owner.', status: 'Active' },
  { id: 'LEVEL-04', name: 'Sire Sourcing Company Account', description: 'Supplier supplying Sires or Sire/Semen stock to the herdbook system.', status: 'Active' },
];

// ─── ROLE ─────────────────────────────────────────────────────────────────────
export interface CustomRoleDefinition {
  id: string;
  name: string;
  category?: 'Breeding' | 'Farm' | 'Herdbook' | 'Certification' | 'Stock' | 'Sourcing Company' | 'Customer' | 'System' | string;
  description?: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
  status?: 'Active' | 'Inactive';
  clonedFrom?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const APPROVED_ROLES: CustomRoleDefinition[] = [
  { id: 'ROLE-01', name: 'System Administrator', category: 'System', description: 'Full system configuration, security authority, and user access management.', permissions: ALL_PERMISSIONS as PermissionKey[], isSystem: true, status: 'Active' },
  { id: 'ROLE-02', name: 'Breeding Specialist', category: 'Breeding', description: 'Initiates 6-step breeding programs, confirms AI services, and manages technical costing.', permissions: DEFAULT_ROLE_PERMISSIONS['Breeding Specialist'], isSystem: true, status: 'Active' },
  { id: 'ROLE-03', name: 'Farm Manager', category: 'Farm', description: 'Full operational control and lifecycle management of farm animals and breeding requests.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Manager'], isSystem: true, status: 'Active' },
  { id: 'ROLE-04', name: 'Herdbook Verifier', category: 'Herdbook', description: 'Verifies registration credentials, pedigree relationships, and official status.', permissions: ['herdbook.view', 'herdbook.verify', 'herdbook.publish', 'sire.verify', 'dam.verify', 'calf.verify'], isSystem: true, status: 'Active' },
  { id: 'ROLE-05', name: 'Certificate Officer', category: 'Certification', description: 'Generates, manages, and downloads official A4 landscape PNG certificates and QR codes.', permissions: ['certificate.view', 'certificate.generate', 'certificate.download', 'certification.view', 'certification.approve', 'certification.reject'], isSystem: true, status: 'Active' },
  { id: 'ROLE-06', name: 'Stock Manager', category: 'Stock', description: 'Manages semen straw inventory, stock-in batches, and unit pricing.', permissions: ['stock.view', 'stock.create', 'stock.update', 'stock.delete', 'stock.transfer', 'dashboard.view'], isSystem: true, status: 'Active' },
  { id: 'ROLE-07', name: 'Sourcing Manager', category: 'Sourcing Company', description: 'Manages company-supplied Sires, image uploads, bloodline metadata, and semen stock.', permissions: DEFAULT_ROLE_PERMISSIONS['Sourcing Manager'], isSystem: true, status: 'Active' },
  { id: 'ROLE-08', name: 'Customer Viewer', category: 'Customer', description: 'Read-only access to personal owned cows, calves, breeding programs, and certificates.', permissions: DEFAULT_ROLE_PERMISSIONS['Customer Viewer'], isSystem: true, status: 'Active' },
];

// ─── DATA SCOPE ───────────────────────────────────────────────────────────────
export type DataScopeType = 'GLOBAL' | 'FARM' | 'CUSTOMER' | 'SOURCING_COMPANY' | 'ASSIGNED_RECORD' | 'OWN_BREEDER_ONLY';

// ─── USER ROLE ITEM ───────────────────────────────────────────────────────────
export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  notes?: string;
  accountType?: 'INTERNAL' | 'BUSINESS';
  userLevel?: string;
  userLevelId?: string;
  role: string;
  roleIds?: string[];
  dataScope?: DataScopeType;
  status: 'Pending' | 'Active' | 'Inactive' | 'Suspended' | 'Disabled';
  password?: string;
  permissions?: PermissionKey[];
  farmLocation?: string;
  companyName?: string;
  cowOwner?: string;
  lastLogin?: string;
  createdAt?: string;
  breederId?: string;
  farmId?: string;
  sourcingCompanyId?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  idVerificationStatus?: string;
}

// ─── FARM ITEM ────────────────────────────────────────────────────────────────
export interface FarmItem {
  id: string;
  name: string;
  ownerId?: string;
  managerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPassword?: string;
  address?: string;
  capacity?: number;
  notes?: string;
}

// ─── MASTER SETUP ─────────────────────────────────────────────────────────────
export interface MasterSetup {
  breeds?: string[];
  locations?: string[];
  buyTypes?: string[];
  healthStatuses?: string[];
  vaccineTypes?: string[];
  feedTypes?: string[];
  expenseCategories?: string[];
  paymentMethods?: string[];
  sexes?: string[];
  diseaseTypes?: string[];
  batchTypes?: string[];
  weightUnits?: string[];
  revenueTypes?: string[];
  purchaseTypes?: string[];
  categories?: string[];
  farms?: FarmItem[];
  users: UserRoleItem[];
  roles: CustomRoleDefinition[];
  userLevels?: UserLevelItem[];
}
