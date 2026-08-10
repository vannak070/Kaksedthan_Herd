import { query } from '../config/database';
import { MasterSetup, UserRoleItem, CustomRoleDefinition, DEFAULT_ROLE_PERMISSIONS, FarmItem } from '../lib/types';
import { PoolClient } from 'pg';

const DEFAULT_FARMS: FarmItem[] = [
  { id: 'FARM-01', name: 'រទាំង', ownerId: '4', address: 'រទាំង, ព្រែកព្នៅ, ភ្នំពេញ', capacity: 100, notes: 'ទីតាំងបំប៉នសាច់ និងផលិតចំណី' },
  { id: 'FARM-02', name: 'ព្រៃវែង', ownerId: '6', address: 'ក្រុងព្រៃវែង, ខេត្តព្រៃវែង', capacity: 150, notes: 'ទីតាំងបង្កាត់ពូជ និងព្យាបាល' },
  { id: 'FARM-03', name: 'បន្ទាយមានជ័យ', address: 'ក្រុងសិរីសោភ័ណ, ខេត្តបន្ទាយមានជ័យ', capacity: 80, notes: 'ក្រោលផ្ទេរ និងចែកចាយ' },
  { id: 'FARM-04', name: 'ក្រោល A', capacity: 50, notes: 'ក្រោលបំប៉នពិសេស A' },
  { id: 'FARM-05', name: 'ក្រោល B', capacity: 50, notes: 'ក្រោលបំប៉នពិសេស B' }
];

const DEFAULT_ROLES: CustomRoleDefinition[] = [
  { id: 'ROLE-01', name: 'Super Admin', description: 'Full system management and security authority.', permissions: DEFAULT_ROLE_PERMISSIONS['Super Admin'], isSystem: true },
  { id: 'ROLE-02', name: 'Admin', description: 'Full business operations control and user creation privileges.', permissions: DEFAULT_ROLE_PERMISSIONS['Admin'], isSystem: true },
  { id: 'ROLE-03', name: 'Company', description: 'Manages user accounts, permissions, and multiple farms under them.', permissions: DEFAULT_ROLE_PERMISSIONS['Company'], isSystem: true },
  { id: 'ROLE-04', name: 'Farm Owner', description: 'Full operational control and lifecycle management of their specific farm.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'], isSystem: true },
  { id: 'ROLE-05', name: 'Farm Staff', description: 'Records weights, health logs, and tracks daily checklists based on custom permissions.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Staff'], isSystem: true },
  { id: 'ROLE-06', name: 'Veterinarian', description: 'Responsible for health tracking, medical records, deworming, and diagnostics.', permissions: DEFAULT_ROLE_PERMISSIONS['Veterinarian'], isSystem: true }
];

const DEFAULT_USERS: UserRoleItem[] = [
  { id: '1', name: 'Vannak Admin', email: 'vannak@snrfarm.com', role: 'Super Admin', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Super Admin'] },
  { id: '2', name: 'Dr. Vannak Breeder', email: 'breeder@snrfarm.com', role: 'Breeder', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Breeder'] },
  { id: '3', name: 'Bona Farm Owner', email: 'bona.v@snrfarm.com', role: 'Farm Owner', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'], farmLocation: 'រទាំង' },
  { id: '4', name: 'Sophea Cow Owner', email: 'sophea@customer.com', role: 'Customer / Cow Owner', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Customer / Cow Owner'] },
  { id: '5', name: 'ABS Global Sourcing Co.', email: 'sourcing@absglobal.com', role: 'Sire Sourcing Company', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Sire Sourcing Company'] }
];

export class SettingsRepository {
  private async executeQuery(sql: string, params?: unknown[], client?: PoolClient) {
    if (client) {
      return client.query(sql, params);
    }
    return query(sql, params);
  }

  async getSettings(): Promise<MasterSetup> {
    const res = await query("SELECT data FROM master_settings WHERE key = 'master_setup'");
    let settings: MasterSetup;

    if (res.rows.length === 0) {
      settings = {
        breeds: ['គោទន្លេ', 'កាត់ Brahman', 'កាត់ Wagyu'],
        locations: ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ', 'ក្រោល A', 'ក្រោល B'],
        buyTypes: ['Lumsum', 'Weight', 'Born in Farm', 'Transfer', 'Partnership'],
        healthStatuses: ['Good', 'Fair', 'Poor', 'Dead'],
        vaccineTypes: ['Foot and Mouth', 'Brucellosis', 'Anthrax', 'Dewormer A', 'Vitamin Boost'],
        feedTypes: ['Silage', 'Concentrate Feed', 'Fresh Grass', 'Hay Mix'],
        expenseCategories: ['Bank interest', 'forage', 'Straw', 'Water-Fire', 'Asset', 'Salary', 'Other', 'Corn / grass', 'Vaccines and medicines'],
        paymentMethods: ['ABA Pay', 'Cash', 'Bank Transfer'],
        sexes: ['Male', 'Female'],
        diseaseTypes: ['Foot and Mouth Disease (FMD)', 'Brucellosis', 'Anthrax', 'Pneumonia', 'Parasite Infection'],
        batchTypes: ['Fattening Program', 'Quanrantin & Vet Card', 'Selling Pool'],
        weightUnits: ['kg', 'lbs'],
        revenueTypes: ['Livestock Sale', 'Manure Sale', 'Milk Sale', 'Partnership Share'],
        purchaseTypes: ['Purchase', 'Born in Farm', 'Transfer', 'Partnership'],
        users: DEFAULT_USERS,
        roles: DEFAULT_ROLES,
        farms: DEFAULT_FARMS
      };
    } else {
      settings = res.rows[0].data;
      if (!settings.roles || settings.roles.length === 0) {
        settings.roles = DEFAULT_ROLES;
      }
      if (!settings.farms || settings.farms.length === 0) {
        settings.farms = DEFAULT_FARMS;
      }
    }

    const usersRes = await query('SELECT * FROM users ORDER BY created_at ASC');
    if (usersRes.rows.length === 0) {
      for (const u of DEFAULT_USERS) {
        await query(
          `INSERT INTO users (id, name, email, role, status, password, permissions, farm_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, role=$4, status=$5, password=$6, permissions=$7, farm_location=$8`,
          [u.id, u.name, u.email, u.role, u.status, u.password, JSON.stringify(u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || []), u.farmLocation || null]
        );
      }
      settings.users = DEFAULT_USERS;
    } else {
      settings.users = usersRes.rows.map(row => {
        let perms = row.permissions;
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch { perms = []; }
        }
        if (!perms || (Array.isArray(perms) && perms.length === 0)) {
          perms = DEFAULT_ROLE_PERMISSIONS[row.role] || [];
        }

        return {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          userLevel: row.user_level,
          userLevelId: row.user_level_id,
          dataScope: row.data_scope || 'ASSIGNED_RECORD',
          status: row.status,
          password: row.password,
          permissions: perms,
          farmLocation: row.farm_location || undefined,
          nationalId: row.national_id,
          idFrontUrl: row.id_front_url,
          idBackUrl: row.id_back_url,
          idVerificationStatus: row.id_verification_status || 'Pending',
          farmId: row.farm_id
        };
      });
    }

    return settings;
  }

  async updateSettings(settings: MasterSetup, client?: PoolClient): Promise<MasterSetup> {
    const sql = `
      INSERT INTO master_settings (key, data, updated_at)
      VALUES ('master_setup', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP
    `;
    await this.executeQuery(sql, [JSON.stringify(settings)], client);

    if (settings.users) {
      if (settings.users.length > 0) {
        const userIds = settings.users.map(u => u.id);
        await this.executeQuery(
          `DELETE FROM users WHERE id NOT IN (${userIds.map((_, idx) => `$${idx + 1}`).join(', ')})`,
          userIds,
          client
        );
      } else {
        await this.executeQuery(`DELETE FROM users`, [], client);
      }

      for (const u of settings.users) {
        const permsToSave = u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || [];
        await this.executeQuery(
          `INSERT INTO users (id, name, email, role, user_level, user_level_id, data_scope, status, password, permissions, farm_location, national_id, id_front_url, id_back_url, id_verification_status, farm_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO UPDATE SET 
             name=$2, email=$3, role=$4, 
             user_level=COALESCE($5, users.user_level), 
             user_level_id=COALESCE($6, users.user_level_id), 
             data_scope=COALESCE($7, users.data_scope), 
             status=$8, password=$9, permissions=$10, farm_location=$11,
             national_id=COALESCE($12, users.national_id),
             id_front_url=COALESCE($13, users.id_front_url),
             id_back_url=COALESCE($14, users.id_back_url),
             id_verification_status=COALESCE($15, users.id_verification_status),
             farm_id=COALESCE($16, users.farm_id)`,
          [
            u.id, u.name, u.email, u.role,
            (u as any).userLevel || null, (u as any).userLevelId || null, (u as any).dataScope || 'ASSIGNED_RECORD',
            u.status || 'Active', u.password || 'password123', JSON.stringify(permsToSave), u.farmLocation || null,
            (u as any).nationalId || null, (u as any).idFrontUrl || null, (u as any).idBackUrl || null,
            (u as any).idVerificationStatus || 'Pending', (u as any).farmId || null
          ],
          client
        );
      }
    }

    return this.getSettings();
  }

  async getCustomKey(key: string): Promise<any> {
    const res = await query('SELECT data FROM master_settings WHERE key = $1', [key]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data;
  }

  async setCustomKey(key: string, data: any, client?: PoolClient): Promise<any> {
    const sql = `
      INSERT INTO master_settings (key, data, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
      RETURNING data
    `;
    const res = await this.executeQuery(sql, [key, JSON.stringify(data)], client);
    return res.rows[0].data;
  }
}

export const settingsRepository = new SettingsRepository();
