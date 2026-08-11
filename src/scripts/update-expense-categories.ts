import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { MasterSetup } from '../lib/types';

const targetCategories = [
  "Bank interest",
  "forage",
  "Straw",
  "Water-Fire",
  "Asset",
  "Salary",
  "Other",
  "Corn / grass",
  "Vaccines and medicines"
];

async function updateExpenseCategories() {
  console.log("=== Updating Expense Categories under Master Setup ===");

  const client = await pool.connect();
  try {
    // 1. Fetch existing settings from PostgreSQL
    const res = await client.query("SELECT data FROM master_settings WHERE key = 'master_setup'");
    let settings: MasterSetup;

    if (res.rows.length === 0) {
      settings = {
        breeds: ['គោទន្លេ', 'កាត់ Brahman', 'កាត់ Wagyu'],
        locations: ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ', 'ក្រោល A', 'ក្រោល B'],
        buyTypes: ['Lumsum', 'Weight', 'Born in Farm', 'Transfer', 'Partnership'],
        healthStatuses: ['Good', 'Fair', 'Poor', 'Dead'],
        vaccineTypes: ['Foot and Mouth', 'Brucellosis', 'Anthrax', 'Dewormer A', 'Vitamin Boost'],
        feedTypes: ['Silage', 'Concentrate Feed', 'Fresh Grass', 'Hay Mix'],
        expenseCategories: targetCategories,
        paymentMethods: ['ABA Pay', 'Cash', 'Bank Transfer'],
        sexes: ['Male', 'Female'],
        diseaseTypes: ['Foot and Mouth Disease (FMD)', 'Brucellosis', 'Anthrax', 'Pneumonia', 'Parasite Infection'],
        batchTypes: ['Fattening Program', 'Quanrantin & Vet Card', 'Selling Pool'],
        weightUnits: ['kg', 'lbs'],
        revenueTypes: ['Livestock Sale', 'Manure Sale', 'Milk Sale', 'Partnership Share'],
        purchaseTypes: ['Purchase', 'Born in Farm', 'Transfer', 'Partnership'],
        users: [],
        roles: [],
        userLevels: []
      };
    } else {
      settings = res.rows[0].data;
      settings.expenseCategories = targetCategories;
    }

    // Upsert into master_settings table
    await client.query(
      `INSERT INTO master_settings (key, data) VALUES ('master_setup', $1)
       ON CONFLICT (key) DO UPDATE SET data = $1`,
      [JSON.stringify(settings)]
    );

    console.log("[PostgreSQL] Expense categories updated successfully in master_settings.");
  } catch (err: any) {
    console.error("[PostgreSQL Error]", err.message);
  } finally {
    client.release();
  }

  // 2. Update local db.json cache
  const dbPath = path.join(process.cwd(), 'src/data/db.json');
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!data.settings) {
      data.settings = {};
    }
    data.settings.expenseCategories = targetCategories;
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    console.log("[db.json] Expense categories updated successfully in local cache.");
  }

  process.exit(0);
}

updateExpenseCategories();
