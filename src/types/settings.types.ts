export type PermissionKey =
  | 'dashboard_view'
  | 'stock_view'
  | 'stock_create'
  | 'stock_edit'
  | 'stock_delete'
  | 'batch_view'
  | 'batch_create'
  | 'batch_edit'
  | 'batch_delete'
  | 'weight_view'
  | 'weight_record'
  | 'weight_delete'
  | 'health_view'
  | 'health_record'
  | 'health_delete'
  | 'sales_view'
  | 'sales_record'
  | 'sales_delete'
  | 'expenses_view'
  | 'expenses_record'
  | 'expenses_delete'
  | 'analytics_view'
  | 'settings_manage'
  | 'farms_manage'
  | 'feed_view'
  | 'feed_manage'
  // Granular Herdbook Module Actions
  | 'SIRE.VIEW' | 'SIRE.CREATE' | 'SIRE.EDIT' | 'SIRE.DELETE' | 'SIRE.VERIFY' | 'SIRE.DOWNLOAD'
  | 'DAM.VIEW' | 'DAM.CREATE' | 'DAM.EDIT' | 'DAM.DELETE' | 'DAM.VERIFY'
  | 'CALF.VIEW' | 'CALF.CREATE' | 'CALF.EDIT' | 'CALF.DELETE' | 'CALF.VERIFY'
  | 'BREEDING_PROGRAM.VIEW' | 'BREEDING_PROGRAM.CREATE' | 'BREEDING_PROGRAM.EDIT' | 'BREEDING_PROGRAM.CONFIRM' | 'BREEDING_PROGRAM.APPROVE'
  | 'BREEDING_COST.VIEW' | 'BREEDING_COST.CREATE' | 'BREEDING_COST.EDIT'
  | 'STOCK.VIEW' | 'STOCK.CREATE' | 'STOCK.EDIT' | 'STOCK.TRANSFER'
  | 'HERDBOOK.VIEW' | 'HERDBOOK.VERIFY' | 'HERDBOOK.PUBLISH'
  | 'CERTIFICATE.VIEW' | 'CERTIFICATE.GENERATE' | 'CERTIFICATE.DOWNLOAD'
  | 'SYSTEM_SETUP.VIEW' | 'SYSTEM_SETUP.EDIT';

export interface PermissionCategory {
  id: string;
  label: string;
  items: { key: PermissionKey; label: string; description: string }[];
}

export const PERMISSION_MODULES: PermissionCategory[] = [
  {
    id: 'dashboard',
    label: '📊 Dashboard Overview',
    items: [
      { key: 'dashboard_view', label: 'View Dashboard', description: 'Access main KPI overview and metrics.' }
    ]
  },
  {
    id: 'sire',
    label: '🐂 Sire Register Management',
    items: [
      { key: 'SIRE.VIEW', label: 'View Sire Records', description: 'Access Sire registry, pedigree, and sourcing info.' },
      { key: 'SIRE.CREATE', label: 'Register New Sire', description: 'Add new Sire bull records to the system.' },
      { key: 'SIRE.EDIT', label: 'Edit Sire Records', description: 'Update Sire bloodline, image, and details.' },
      { key: 'SIRE.DELETE', label: 'Delete Sire Records', description: 'Permanently remove Sire records.' },
      { key: 'SIRE.VERIFY', label: 'Verify Sire Pedigree', description: 'Approve official Sire pedigree credentials.' },
      { key: 'SIRE.DOWNLOAD', label: 'Download Sire Certificate', description: 'Download PNG certificates for Sires.' }
    ]
  },
  {
    id: 'dam',
    label: '🐄 Dam Cow Management',
    items: [
      { key: 'DAM.VIEW', label: 'View Dam Records', description: 'Access Dam cow registry and breeding status.' },
      { key: 'DAM.CREATE', label: 'Register New Dam', description: 'Add new Dam cow profiles.' },
      { key: 'DAM.EDIT', label: 'Edit Dam Details', description: 'Update Dam breeding status and information.' },
      { key: 'DAM.DELETE', label: 'Delete Dam Records', description: 'Remove Dam records.' },
      { key: 'DAM.VERIFY', label: 'Verify Dam Lineage', description: 'Approve Dam pedigree status.' }
    ]
  },
  {
    id: 'calf',
    label: '🐮 Calf Birth Management',
    items: [
      { key: 'CALF.VIEW', label: 'View Calf Records', description: 'Access calf birth registry and lineage.' },
      { key: 'CALF.CREATE', label: 'Register Calf Birth', description: 'Record new calf births with Sire/Dam links.' },
      { key: 'CALF.EDIT', label: 'Edit Calf Details', description: 'Update calf weight, health, and pedigree.' },
      { key: 'CALF.DELETE', label: 'Delete Calf Records', description: 'Remove calf birth logs.' },
      { key: 'CALF.VERIFY', label: 'Verify Calf Birth', description: 'Approve official calf birth certificate.' }
    ]
  },
  {
    id: 'breeding',
    label: '🧬 Breeding Program Operations',
    items: [
      { key: 'BREEDING_PROGRAM.VIEW', label: 'View Breeding Programs', description: 'Access 6-step guided breeding programs.' },
      { key: 'BREEDING_PROGRAM.CREATE', label: 'Create Breeding Program', description: 'Initiate new breeding workflow.' },
      { key: 'BREEDING_PROGRAM.EDIT', label: 'Edit Breeding Program', description: 'Modify breeding details and dates.' },
      { key: 'BREEDING_PROGRAM.CONFIRM', label: 'Confirm Breeding Service', description: 'Confirm Insemination execution.' },
      { key: 'BREEDING_PROGRAM.APPROVE', label: 'Approve Pregnancy Status', description: 'Confirm PD results and calving dates.' },
      { key: 'BREEDING_COST.VIEW', label: 'View Breeding Costing', description: 'Access costing breakdowns in USD.' },
      { key: 'BREEDING_COST.CREATE', label: 'Set Service & Breeder Fees', description: 'Configure semen cost and service fees.' },
      { key: 'BREEDING_COST.EDIT', label: 'Override Unit Prices', description: 'Authorized override of stock straw prices.' }
    ]
  },
  {
    id: 'stock',
    label: '🧪 Stock Insemination (Semen Straws)',
    items: [
      { key: 'STOCK.VIEW', label: 'View Semen Stock', description: 'Access inventory of available semen straws.' },
      { key: 'STOCK.CREATE', label: 'Add Semen Stock', description: 'Add new semen batch imports.' },
      { key: 'STOCK.EDIT', label: 'Modify Stock Ratios & Prices', description: 'Update straw pricing and batch status.' },
      { key: 'STOCK.TRANSFER', label: 'Transfer Stock Rations', description: 'Log stock usage and distribution.' }
    ]
  },
  {
    id: 'herdbook',
    label: '📜 Herdbook & Certificate Center',
    items: [
      { key: 'HERDBOOK.VIEW', label: 'View Herdbook Registry', description: 'Access official cattle registry.' },
      { key: 'HERDBOOK.VERIFY', label: 'Verify Herdbook Entry', description: 'Official verification of registration.' },
      { key: 'HERDBOOK.PUBLISH', label: 'Publish to QR Registry', description: 'Publish record for public QR scanning.' },
      { key: 'CERTIFICATE.VIEW', label: 'View Certificates', description: 'Access official A4 landscape certificates.' },
      { key: 'CERTIFICATE.GENERATE', label: 'Generate Certificate PNG', description: 'Generate high-res PNG certificates.' },
      { key: 'CERTIFICATE.DOWNLOAD', label: 'Download Certificate File', description: 'Download PNG certificate images.' }
    ]
  },
  {
    id: 'system',
    label: '⚙️ System Setup & Access Control',
    items: [
      { key: 'SYSTEM_SETUP.VIEW', label: 'View System Setup', description: 'Access configuration hubs.' },
      { key: 'SYSTEM_SETUP.EDIT', label: 'Modify System Setup', description: 'Configure business rules and access.' },
      { key: 'settings_manage', label: 'Manage ERP Setup & Users', description: 'Configure master dropdowns and users.' },
      { key: 'farms_manage', label: 'Manage Farms & Branches', description: 'Create and configure farm locations.' }
    ]
  }
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_MODULES.flatMap(m => m.items.map(i => i.key));

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  'Super Admin': ALL_PERMISSIONS,
  'Admin': ALL_PERMISSIONS,
  'Breeder': [
    'dashboard_view', 'SIRE.VIEW', 'DAM.VIEW', 'DAM.CREATE', 'DAM.EDIT', 'CALF.VIEW', 'CALF.CREATE', 'CALF.EDIT',
    'BREEDING_PROGRAM.VIEW', 'BREEDING_PROGRAM.CREATE', 'BREEDING_PROGRAM.EDIT', 'BREEDING_PROGRAM.CONFIRM',
    'BREEDING_COST.VIEW', 'BREEDING_COST.CREATE', 'BREEDING_COST.EDIT', 'STOCK.VIEW', 'STOCK.CREATE', 'STOCK.EDIT',
    'HERDBOOK.VIEW', 'HERDBOOK.VERIFY', 'CERTIFICATE.VIEW', 'CERTIFICATE.GENERATE', 'CERTIFICATE.DOWNLOAD'
  ],
  'Farm Owner': [
    'dashboard_view', 'SIRE.VIEW', 'DAM.VIEW', 'DAM.CREATE', 'DAM.EDIT', 'CALF.VIEW', 'CALF.CREATE', 'CALF.EDIT',
    'BREEDING_PROGRAM.VIEW', 'BREEDING_PROGRAM.CREATE', 'BREEDING_COST.VIEW', 'HERDBOOK.VIEW',
    'CERTIFICATE.VIEW', 'CERTIFICATE.DOWNLOAD'
  ],
  'Customer / Cow Owner': [
    'dashboard_view', 'DAM.VIEW', 'CALF.VIEW', 'BREEDING_PROGRAM.VIEW', 'BREEDING_COST.VIEW',
    'HERDBOOK.VIEW', 'CERTIFICATE.VIEW', 'CERTIFICATE.DOWNLOAD'
  ],
  'Sire Sourcing Company': [
    'dashboard_view', 'SIRE.VIEW', 'SIRE.CREATE', 'SIRE.EDIT', 'SIRE.DOWNLOAD',
    'STOCK.VIEW', 'STOCK.CREATE', 'STOCK.EDIT', 'HERDBOOK.VIEW', 'CERTIFICATE.VIEW', 'CERTIFICATE.DOWNLOAD'
  ]
};

// 1. User Level Interface (Account Category)
export interface UserLevelItem {
  id: string;
  name: 'Breeder' | 'Farm Owner' | 'Customer / Cow Owner' | 'Sire Sourcing Company' | string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const APPROVED_USER_LEVELS: UserLevelItem[] = [
  { id: 'LEVEL-01', name: 'Breeder Account', description: 'Breeding specialist & AI operations professional managing services and programs.', status: 'Active' },
  { id: 'LEVEL-02', name: 'Farm Owner Account', description: 'Owner/manager of farm stations controlling farm animals, breeding, and costs.', status: 'Active' },
  { id: 'LEVEL-03', name: 'Farmer / Farm Manager Account', description: 'Day-to-day operational manager of an authorized farm under a Farm Owner.', status: 'Active' },
  { id: 'LEVEL-04', name: 'Sire Sourcing Company Account', description: 'Supplier supplying Sires or Sire/Semen stock to the herdbook system.', status: 'Active' }
];

// 2. Role Interface (Responsibility)
export interface CustomRoleDefinition {
  id: string;
  name: string;
  category?: 'Breeding' | 'Farm' | 'Herdbook' | 'Certification' | 'Stock' | 'Sourcing Company' | 'Customer' | 'System';
  description?: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export const APPROVED_ROLES: CustomRoleDefinition[] = [
  { id: 'ROLE-01', name: 'System Administrator', category: 'System', description: 'Full system configuration, security authority, and user access management.', permissions: ALL_PERMISSIONS, isSystem: true },
  { id: 'ROLE-02', name: 'Breeding Specialist', category: 'Breeding', description: 'Initiates 6-step breeding programs, confirms AI services, and manages technical costing.', permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'], isSystem: true },
  { id: 'ROLE-03', name: 'Farm Manager', category: 'Farm', description: 'Full operational control and lifecycle management of farm animals and breeding requests.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'], isSystem: true },
  { id: 'ROLE-04', name: 'Herdbook Verifier', category: 'Herdbook', description: 'Verifies registration credentials, pedigree relationships, and official status.', permissions: ['HERDBOOK.VIEW', 'HERDBOOK.VERIFY', 'HERDBOOK.PUBLISH', 'SIRE.VERIFY', 'DAM.VERIFY', 'CALF.VERIFY'], isSystem: true },
  { id: 'ROLE-05', name: 'Certificate Officer', category: 'Certification', description: 'Generates, manages, and downloads official A4 landscape PNG certificates and QR codes.', permissions: ['CERTIFICATE.VIEW', 'CERTIFICATE.GENERATE', 'CERTIFICATE.DOWNLOAD'], isSystem: true },
  { id: 'ROLE-06', name: 'Stock Manager', category: 'Stock', description: 'Manages semen straw inventory, stock-in batches, and unit pricing.', permissions: ['STOCK.VIEW', 'STOCK.CREATE', 'STOCK.EDIT', 'STOCK.TRANSFER'], isSystem: true },
  { id: 'ROLE-07', name: 'Sourcing Manager', category: 'Sourcing Company', description: 'Manages company-supplied Sires, image uploads, bloodline metadata, and semen stock.', permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'], isSystem: true },
  { id: 'ROLE-08', name: 'Customer Viewer', category: 'Customer', description: 'Read-only access to personal owned cows, calves, breeding programs, and certificates.', permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'], isSystem: true }
];

// Data Scope Types
export type DataScopeType = 'GLOBAL' | 'FARM' | 'CUSTOMER' | 'SOURCING_COMPANY' | 'ASSIGNED_RECORD';

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  userLevel?: 'Breeder' | 'Farm Owner' | 'Customer / Cow Owner' | 'Sire Sourcing Company' | string;
  role: string;
  roleIds?: string[];
  dataScope?: DataScopeType;
  status: 'Active' | 'Inactive' | 'Suspended';
  password?: string;
  permissions?: PermissionKey[];
  farmLocation?: string;
  companyName?: string;
  cowOwner?: string;
  lastLogin?: string;
  createdAt?: string;
}

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

export interface MasterSetup {
  breeds: string[];
  locations: string[];
  buyTypes: string[];
  healthStatuses: string[];
  vaccineTypes: string[];
  feedTypes: string[];
  expenseCategories: string[];
  paymentMethods: string[];
  sexes: string[];
  diseaseTypes: string[];
  batchTypes: string[];
  weightUnits: string[];
  revenueTypes: string[];
  purchaseTypes?: string[];
  users: UserRoleItem[];
  roles: CustomRoleDefinition[];
  userLevels?: UserLevelItem[];
  farms?: FarmItem[];
}
