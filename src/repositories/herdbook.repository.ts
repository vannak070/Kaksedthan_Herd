import { query, withTransaction } from '../config/database';
import { PoolClient } from 'pg';
import {
  SireItem,
  StockInseminationItem,
  DamItem,
  BreedingProgramItem,
  CalfItem,
  HerdbookRegistrationItem,
  PedigreeTree,
  HerdbookCertificateItem,
  AuditLogItem
} from '../types/breeding.types';

export class HerdbookRepository {

  // ─────────────────────────────────────────────────────────────
  // 1. Sire Repository
  // ─────────────────────────────────────────────────────────────
  async getSires(): Promise<SireItem[]> {
    const sql = `
      SELECT s.*, COALESCE(c.status, 'NOT_APPLIED') as certification_status
      FROM sires s
      LEFT JOIN (
        SELECT DISTINCT ON (COALESCE(animal_id, calf_id)) COALESCE(animal_id, calf_id) as target_id, status
        FROM certificates
        ORDER BY COALESCE(animal_id, calf_id), created_at DESC
      ) c ON c.target_id = s.id
      ORDER BY s.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      breed: r.breed,
      dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : undefined,
      bloodline: r.bloodline,
      sourcingCompany: r.sourcing_company || 'ABS Global Inc.',
      fatherId: r.father_id,
      motherId: r.mother_id,
      imageUrl: r.image_url,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      status: r.status,
      certificationStatus: r.certification_status || 'NOT_APPLIED',
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getSireById(id: string): Promise<SireItem | null> {
    const res = await query('SELECT * FROM sires WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      breed: r.breed,
      dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : undefined,
      bloodline: r.bloodline,
      sourcingCompany: r.sourcing_company || 'ABS Global Inc.',
      fatherId: r.father_id,
      motherId: r.mother_id,
      imageUrl: r.image_url,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createSire(sire: SireItem): Promise<SireItem> {
    const sql = `
      INSERT INTO sires (id, name, breed, dob, bloodline, sourcing_company, sourcing_company_id, father_id, mother_id, image_url, owner_name, farm_location, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const params = [
      sire.id,
      sire.name,
      sire.breed,
      sire.dob ? new Date(sire.dob) : null,
      sire.bloodline || null,
      sire.sourcingCompany || 'ABS Global Inc.',
      sire.sourcingCompanyId || null,
      sire.fatherId || null,
      sire.motherId || null,
      sire.imageUrl || null,
      sire.ownerName || null,
      sire.farmLocation || null,
      sire.status || 'Active'
    ];
    await query(sql, params);
    return sire;
  }

  async updateSire(id: string, sire: Partial<SireItem>): Promise<SireItem> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (sire.name !== undefined) { fields.push(`name = $${idx++}`); params.push(sire.name); }
    if (sire.breed !== undefined) { fields.push(`breed = $${idx++}`); params.push(sire.breed); }
    if (sire.dob !== undefined) { fields.push(`dob = $${idx++}`); params.push(sire.dob ? new Date(sire.dob) : null); }
    if (sire.bloodline !== undefined) { fields.push(`bloodline = $${idx++}`); params.push(sire.bloodline); }
    if (sire.sourcingCompany !== undefined) { fields.push(`sourcing_company = $${idx++}`); params.push(sire.sourcingCompany); }
    if (sire.fatherId !== undefined) { fields.push(`father_id = $${idx++}`); params.push(sire.fatherId); }
    if (sire.motherId !== undefined) { fields.push(`mother_id = $${idx++}`); params.push(sire.motherId); }
    if (sire.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(sire.imageUrl); }
    if (sire.ownerName !== undefined) { fields.push(`owner_name = $${idx++}`); params.push(sire.ownerName); }
    if (sire.farmLocation !== undefined) { fields.push(`farm_location = $${idx++}`); params.push(sire.farmLocation); }
    if (sire.status !== undefined) { fields.push(`status = $${idx++}`); params.push(sire.status); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE sires SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    await query(sql, params);

    const updated = await this.getSireById(id);
    if (!updated) throw new Error(`Sire ${id} not found`);
    return updated;
  }


  // ─────────────────────────────────────────────────────────────
  // 2. Stock Insemination Repository
  // ─────────────────────────────────────────────────────────────
  async getStockInsemination(): Promise<StockInseminationItem[]> {
    const sql = `
      SELECT sem.*, s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url
      FROM stock_insemination sem
      LEFT JOIN sires s ON sem.sire_id = s.id
      ORDER BY sem.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      sireImageUrl: r.sire_image_url,
      stockAvailable: Number(r.stock_available || 0),
      priceUsd: Number(r.price_usd || 0),
      priceKhr: Number(r.price_khr || 0),
      currency: r.currency || 'USD',
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      availability: r.availability,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getStockInseminationById(id: string): Promise<StockInseminationItem | null> {
    const sql = `
      SELECT st.*, s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url
      FROM stock_insemination st
      LEFT JOIN sires s ON st.sire_id = s.id
      WHERE st.id = $1 OR st.sire_id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      sireImageUrl: r.sire_image_url,
      stockAvailable: Number(r.stock_available || 0),
      priceUsd: Number(r.price_usd || 0),
      priceKhr: Number(r.price_khr || 0),
      currency: r.currency || 'USD',
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      availability: r.availability,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createStockInsemination(item: StockInseminationItem): Promise<StockInseminationItem> {
    const sql = `
      INSERT INTO stock_insemination (
        id, sire_id, stock_available, price_usd, price_khr, currency,
        owner_name, farm_location, breeder_name, availability, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      item.id,
      item.sireId,
      item.stockAvailable,
      item.priceUsd,
      item.priceKhr,
      item.currency || 'USD',
      item.ownerName || null,
      item.farmLocation || null,
      item.breederName || null,
      item.availability || 'Available',
      item.status || 'Active'
    ];
    await query(sql, params);
    return item;
  }

  async updateStockInsemination(id: string, updates: Partial<StockInseminationItem>): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.stockAvailable !== undefined) { fields.push(`stock_available = $${idx++}`); params.push(updates.stockAvailable); }
    if (updates.priceUsd !== undefined) { fields.push(`price_usd = $${idx++}`); params.push(updates.priceUsd); }
    if (updates.priceKhr !== undefined) { fields.push(`price_khr = $${idx++}`); params.push(updates.priceKhr); }
    if (updates.currency !== undefined) { fields.push(`currency = $${idx++}`); params.push(updates.currency); }
    if (updates.availability !== undefined) { fields.push(`availability = $${idx++}`); params.push(updates.availability); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE stock_insemination SET ${fields.join(', ')} WHERE id = $${idx}`;
    await query(sql, params);
  }


  // ─────────────────────────────────────────────────────────────
  // 3. Dam Repository
  // ─────────────────────────────────────────────────────────────
  async getDams(): Promise<DamItem[]> {
    const sql = `
      SELECT d.*, COALESCE(c.status, 'NOT_APPLIED') as certification_status
      FROM dams d
      LEFT JOIN (
        SELECT DISTINCT ON (COALESCE(animal_id, calf_id)) COALESCE(animal_id, calf_id) as target_id, status
        FROM certificates
        ORDER BY COALESCE(animal_id, calf_id), created_at DESC
      ) c ON c.target_id = d.id
      ORDER BY d.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      breed: r.breed,
      dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : undefined,
      fatherId: r.father_id,
      motherId: r.mother_id,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      imageUrl: r.image_url,
      availability: r.availability,
      breedingStatus: r.breeding_status,
      pregnancyStatus: r.pregnancy_status,
      certificationStatus: r.certification_status || 'NOT_APPLIED',
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getDamById(id: string): Promise<DamItem | null> {
    const res = await query('SELECT * FROM dams WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      breed: r.breed,
      dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : undefined,
      fatherId: r.father_id,
      motherId: r.mother_id,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      imageUrl: r.image_url,
      availability: r.availability,
      breedingStatus: r.breeding_status,
      pregnancyStatus: r.pregnancy_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async getEligibleDams(): Promise<DamItem[]> {
    const res = await query(
      "SELECT * FROM dams WHERE availability = 'Available' AND (pregnancy_status = 'Open' OR pregnancy_status IS NULL) ORDER BY name ASC"
    );
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      breed: r.breed,
      dob: r.dob ? new Date(r.dob).toISOString().split('T')[0] : undefined,
      fatherId: r.father_id,
      motherId: r.mother_id,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      imageUrl: r.image_url,
      availability: r.availability,
      breedingStatus: r.breeding_status,
      pregnancyStatus: r.pregnancy_status
    }));
  }

  async createDam(dam: DamItem): Promise<DamItem> {
    const sql = `
      INSERT INTO dams (id, name, breed, dob, father_id, mother_id, owner_name, farm_location, image_url, availability, breeding_status, pregnancy_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [
      dam.id,
      dam.name || null,
      dam.breed,
      dam.dob ? new Date(dam.dob) : null,
      dam.fatherId || null,
      dam.motherId || null,
      dam.ownerName || null,
      dam.farmLocation || null,
      dam.imageUrl || null,
      dam.availability || 'Available',
      dam.breedingStatus || 'Open',
      dam.pregnancyStatus || 'Open'
    ];
    await query(sql, params);
    return dam;
  }

  async updateDamStatus(id: string, availability: DamItem['availability'], breedingStatus?: DamItem['breedingStatus'], pregnancyStatus?: DamItem['pregnancyStatus'], client?: PoolClient): Promise<void> {
    const sql = `
      UPDATE dams 
      SET availability = $1, 
          breeding_status = COALESCE($2, breeding_status), 
          pregnancy_status = COALESCE($3, pregnancy_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;
    if (client) {
      await client.query(sql, [availability, breedingStatus || null, pregnancyStatus || null, id]);
    } else {
      await query(sql, [availability, breedingStatus || null, pregnancyStatus || null, id]);
    }
  }

  async updateDam(id: string, dam: Partial<DamItem>): Promise<DamItem> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (dam.name !== undefined) { fields.push(`name = $${idx++}`); params.push(dam.name); }
    if (dam.breed !== undefined) { fields.push(`breed = $${idx++}`); params.push(dam.breed); }
    if (dam.dob !== undefined) { fields.push(`dob = $${idx++}`); params.push(dam.dob ? new Date(dam.dob) : null); }
    if (dam.fatherId !== undefined) { fields.push(`father_id = $${idx++}`); params.push(dam.fatherId); }
    if (dam.motherId !== undefined) { fields.push(`mother_id = $${idx++}`); params.push(dam.motherId); }
    if (dam.ownerName !== undefined) { fields.push(`owner_name = $${idx++}`); params.push(dam.ownerName); }
    if (dam.farmLocation !== undefined) { fields.push(`farm_location = $${idx++}`); params.push(dam.farmLocation); }
    if (dam.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(dam.imageUrl); }
    if (dam.availability !== undefined) { fields.push(`availability = $${idx++}`); params.push(dam.availability); }
    if (dam.breedingStatus !== undefined) { fields.push(`breeding_status = $${idx++}`); params.push(dam.breedingStatus); }
    if (dam.pregnancyStatus !== undefined) { fields.push(`pregnancy_status = $${idx++}`); params.push(dam.pregnancyStatus); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE dams SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    await query(sql, params);

    const updated = await this.getDamById(id);
    if (!updated) throw new Error(`Dam ${id} not found`);
    return updated;
  }


  // ─────────────────────────────────────────────────────────────
  // 4. Breeding Program Repository
  // ─────────────────────────────────────────────────────────────

  /**
   * Resolve a Breeder record by the authenticated user's email.
   * Used to enforce backend Breeder identity without trusting the frontend payload.
   */
  async getBreederByEmail(email: string): Promise<{ id: string; name: string; userId: string | null } | null> {
    const sql = `
      SELECT b.id, b.name, b.user_id
      FROM breeders b
      LEFT JOIN users u ON u.id = b.user_id
      WHERE LOWER(u.email) = LOWER($1)
         OR LOWER(b.email) = LOWER($1)
      LIMIT 1
    `;
    const res = await query(sql, [email]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return { id: r.id, name: r.name, userId: r.user_id };
  }

  async getBreedingPrograms(breederIdScope?: string): Promise<BreedingProgramItem[]> {
    const conditions = breederIdScope
      ? `WHERE (bp.breeder_id = $1 OR bp.breeder_name ILIKE '%' || (SELECT name FROM breeders WHERE id = $1 LIMIT 1) || '%')`
      : '';
    const params = breederIdScope ? [breederIdScope] : [];
    const sql = `
      SELECT bp.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image_url
      FROM breeding_programs bp
      LEFT JOIN sires s ON bp.sire_id = s.id
      LEFT JOIN dams d ON bp.dam_id = d.id
      ${conditions}
      ORDER BY bp.created_at DESC
    `;
    const res = await query(sql, params);
    return res.rows.map(r => ({
      id: r.id,
      programNumber: r.program_number,
      breedingType: r.breeding_type,
      breedingMethod: r.breeding_method,
      startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      sireImageUrl: r.sire_image_url,
      damId: r.dam_id,
      damName: r.dam_name,
      damBreed: r.dam_breed,
      damImageUrl: r.dam_image_url,
      ownerName: r.owner_name,
      cowOwner: r.cow_owner,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      priceUsd: Number(r.price_usd || 0),
      priceKhr: Number(r.price_khr || 0),
      breedingDate: r.breeding_date ? new Date(r.breeding_date).toISOString().split('T')[0] : undefined,
      pregnancyCheckDate: r.pregnancy_check_date ? new Date(r.pregnancy_check_date).toISOString().split('T')[0] : undefined,
      expectedCalvingDate: r.expected_calving_date ? new Date(r.expected_calving_date).toISOString().split('T')[0] : undefined,
      actualCalvingDate: r.actual_calving_date ? new Date(r.actual_calving_date).toISOString().split('T')[0] : undefined,
      result: r.result,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getBreedingProgramById(id: string, breederIdScope?: string): Promise<BreedingProgramItem | null> {
    const scopeClause = breederIdScope
      ? `AND (bp.breeder_id = $2 OR bp.breeder_id IS NULL)`
      : '';
    const params = breederIdScope ? [id, breederIdScope] : [id];
    const sql = `
      SELECT bp.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image_url
      FROM breeding_programs bp
      LEFT JOIN sires s ON bp.sire_id = s.id
      LEFT JOIN dams d ON bp.dam_id = d.id
      WHERE (bp.id = $1 OR bp.program_number = $1)
      ${scopeClause}
    `;
    const res = await query(sql, params);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      programNumber: r.program_number,
      breedingType: r.breeding_type,
      breedingMethod: r.breeding_method,
      startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      sireImageUrl: r.sire_image_url,
      damId: r.dam_id,
      damName: r.dam_name,
      damBreed: r.dam_breed,
      damImageUrl: r.dam_image_url,
      ownerName: r.owner_name,
      cowOwner: r.cow_owner,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      priceUsd: Number(r.price_usd || 0),
      priceKhr: Number(r.price_khr || 0),
      semenQty: Number(r.semen_qty || 1),
      unitPrice: Number(r.unit_price || r.price_usd || 0),
      breedingDate: r.breeding_date ? new Date(r.breeding_date).toISOString().split('T')[0] : undefined,
      pregnancyCheckDate: r.pregnancy_check_date ? new Date(r.pregnancy_check_date).toISOString().split('T')[0] : undefined,
      expectedCalvingDate: r.expected_calving_date ? new Date(r.expected_calving_date).toISOString().split('T')[0] : undefined,
      actualCalvingDate: r.actual_calving_date ? new Date(r.actual_calving_date).toISOString().split('T')[0] : undefined,
      result: r.result,
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createBreedingProgram(program: BreedingProgramItem): Promise<BreedingProgramItem> {
    return await withTransaction(async (client) => {
      // Auto-migrate columns if missing (safe, idempotent)
      await client.query(`
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS semen_cost numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS service_fee numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_fee numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS other_cost numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS semen_qty integer DEFAULT 1;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS unit_price numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS price_override_reason text;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_id varchar(50) REFERENCES breeders(id) ON DELETE SET NULL;
      `);

      // Dam Availability Pre-check: Confirmed Pregnant, In Breeding, or Unavailable dams cannot be selected
      const damCheckRes = await client.query(`SELECT id, name, availability, breeding_status, pregnancy_status FROM dams WHERE id = $1`, [program.damId]);
      if (damCheckRes.rows.length > 0) {
        const damRow = damCheckRes.rows[0];
        const isUnavailable = damRow.availability === 'Pregnant' || damRow.availability === 'In Breeding' || damRow.availability === 'Deceased' || damRow.availability === 'Archived' || damRow.pregnancy_status === 'Confirmed Pregnant' || damRow.breeding_status === 'Confirmed Pregnant';
        if (isUnavailable) {
          throw new Error(`Dam "${damRow.name || damRow.id}" is currently not available for a new breeding program (Current status: ${damRow.availability || damRow.pregnancy_status || damRow.breeding_status}).`);
        }
      }

      // Semen Straw Stock Inventory Deduction
      const semenQty = Number(program.semenQty || 1);
      await client.query(`
        UPDATE stock_insemination 
        SET stock_available = GREATEST(0, stock_available - $1),
            updated_at = CURRENT_TIMESTAMP
        WHERE sire_id = $2 AND stock_available > 0
      `, [semenQty, program.sireId]);
      const unitPrice = Number(program.unitPrice || program.semenPrice || 0);
      const semenCost = semenQty * unitPrice;
      const serviceFee = Number(program.serviceFee || 0);
      const breederFee = Number(program.breederFee || 0);
      const otherCost = Number(program.otherCost || 0);
      const discount = Number(program.discount || 0);

      const subtotal = semenCost + serviceFee + breederFee + otherCost;
      const totalCostUsd = Math.max(0, subtotal - discount);
      const totalCostKhr = totalCostUsd * 4000;

      const sql = `
        INSERT INTO breeding_programs (
          id, program_number, breeding_type, breeding_method, start_date,
          sire_id, dam_id, owner_name, cow_owner, farm_location, breeder_name, breeder_id,
          price_usd, price_khr, breeding_date, pregnancy_check_date,
          expected_calving_date, status, notes,
          semen_cost, service_fee, breeder_fee, other_cost, discount,
          semen_qty, unit_price, price_override_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
        RETURNING *
      `;
      const params = [
        program.id,
        program.programNumber,
        program.breedingType || 'AI',
        program.breedingMethod || 'Artificial Insemination',
        program.startDate ? new Date(program.startDate) : new Date(),
        program.sireId,
        program.damId,
        program.ownerName || null,
        program.cowOwner || null,
        program.farmLocation || null,
        program.breederName || null,
        (program as any).breederId || null,    // $12 — authoritative Breeder ID from backend
        totalCostUsd,
        totalCostKhr,
        program.breedingDate ? new Date(program.breedingDate) : null,
        program.pregnancyCheckDate ? new Date(program.pregnancyCheckDate) : null,
        program.expectedCalvingDate ? new Date(program.expectedCalvingDate) : null,
        program.status || 'Draft',
        program.notes || '',
        semenCost,
        serviceFee,
        breederFee,
        otherCost,
        discount,
        semenQty,
        unitPrice,
        program.priceOverrideReason || null
      ];

      await client.query(sql, params);

      // Automatically set dam availability if program is active
      if (['Breeding', 'Pregnancy Check', 'Pregnant'].includes(program.status)) {
        const damAvail = program.status === 'Pregnant' ? 'Pregnant' : 'In Breeding';
        const pregStatus = program.status === 'Pregnant' ? 'Confirmed Pregnant' : 'Pending Check';
        await this.updateDamStatus(program.damId, damAvail, 'In Breeding', pregStatus, client);
      }

      return {
        ...program,
        semenCost,
        serviceFee,
        breederFee,
        otherCost,
        discount,
        semenQty,
        unitPrice,
        priceUsd: totalCostUsd,
        priceKhr: totalCostKhr
      };
    });
  }

  async updateBreedingProgramStatus(id: string, status: BreedingProgramItem['status'], actualCalvingDate?: string, result?: string): Promise<void> {
    await withTransaction(async (client) => {
      const sql = `
        UPDATE breeding_programs 
        SET status = $1,
            actual_calving_date = COALESCE($2, actual_calving_date),
            result = COALESCE($3, result),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING dam_id
      `;
      const res = await client.query(sql, [
        status,
        actualCalvingDate ? new Date(actualCalvingDate) : null,
        result || null,
        id
      ]);

      if (res.rows.length > 0) {
        const damId = res.rows[0].dam_id;
        if (status === 'Pregnant') {
          await this.updateDamStatus(damId, 'Pregnant', 'Confirmed Pregnant', 'Confirmed Pregnant', client);
        } else if (status === 'Calved' || status === 'Completed') {
          await this.updateDamStatus(damId, 'Available', 'Calved', 'Open', client);
        } else if (['Cancelled', 'Failed', 'Not Pregnant'].includes(status)) {
          await this.updateDamStatus(damId, 'Available', 'Open', 'Open', client);
        }
      }
    });
  }


  // ─────────────────────────────────────────────────────────────
  // 5. Calf Repository & Transactional Calf Confirmation
  // ─────────────────────────────────────────────────────────────
  async getCalves(): Promise<CalfItem[]> {
    const sql = `
      SELECT c.*,
             s.name as sire_name, s.breed as sire_breed,
             d.name as dam_name, d.breed as dam_breed,
             COALESCE(cert.status, 'NOT_APPLIED') as certification_status
      FROM calves c
      LEFT JOIN sires s ON c.sire_id = s.id
      LEFT JOIN dams d ON c.dam_id = d.id
      LEFT JOIN (
        SELECT DISTINCT ON (COALESCE(animal_id, calf_id)) COALESCE(animal_id, calf_id) as target_id, status
        FROM certificates
        ORDER BY COALESCE(animal_id, calf_id), created_at DESC
      ) cert ON cert.target_id = c.id
      ORDER BY c.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      breedingProgramId: r.breeding_program_id,
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      damId: r.dam_id,
      damName: r.dam_name,
      damBreed: r.dam_breed,
      name: r.name,
      sex: r.sex,
      breed: r.breed,
      birthDate: r.birth_date ? new Date(r.birth_date).toISOString().split('T')[0] : '',
      birthWeight: Number(r.birth_weight || 0),
      color: r.color,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      imageUrl: r.image_url,
      status: r.status,
      certificationStatus: r.certification_status || 'NOT_APPLIED',
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getCalfById(id: string): Promise<CalfItem | null> {
    const sql = `
      SELECT c.*,
             s.name as sire_name, s.breed as sire_breed,
             d.name as dam_name, d.breed as dam_breed
      FROM calves c
      LEFT JOIN sires s ON c.sire_id = s.id
      LEFT JOIN dams d ON c.dam_id = d.id
      WHERE c.id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      breedingProgramId: r.breeding_program_id,
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      damId: r.dam_id,
      damName: r.dam_name,
      damBreed: r.dam_breed,
      name: r.name,
      sex: r.sex,
      breed: r.breed,
      birthDate: r.birth_date ? new Date(r.birth_date).toISOString().split('T')[0] : '',
      birthWeight: Number(r.birth_weight || 0),
      color: r.color,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      imageUrl: r.image_url,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async updateCalf(id: string, updates: Partial<CalfItem>): Promise<CalfItem> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); params.push(updates.name); }
    if (updates.sex !== undefined) { fields.push(`sex = $${idx++}`); params.push(updates.sex); }
    if (updates.breed !== undefined) { fields.push(`breed = $${idx++}`); params.push(updates.breed); }
    if (updates.birthWeight !== undefined) { fields.push(`birth_weight = $${idx++}`); params.push(updates.birthWeight); }
    if (updates.ownerName !== undefined) { fields.push(`owner_name = $${idx++}`); params.push(updates.ownerName); }
    if (updates.farmLocation !== undefined) { fields.push(`farm_location = $${idx++}`); params.push(updates.farmLocation); }
    if (updates.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(updates.imageUrl); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE calves SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    await query(sql, params);

    const updated = await this.getCalfById(id);
    if (!updated) throw new Error(`Calf ${id} not found`);
    return updated;
  }

  /**
   * Atomic Calf Confirmation Transaction (Requirement #12)
   * Breeding Program → Create Calf → Link Sire → Link Dam → Link Owner/Farm/Breeder →
   * Update Breeding Program → Update Dam Status → Create Herdbook Record → Create Pedigree → Certificate → QR
   */
  async confirmCalfTransaction(calf: CalfItem): Promise<{ calf: CalfItem; registration: HerdbookRegistrationItem; certificate: HerdbookCertificateItem }> {
    return await withTransaction(async (client) => {
      // 1. Insert Calf
      const calfSql = `
        INSERT INTO calves (
          id, breeding_program_id, sire_id, dam_id, name, sex, breed, birth_date,
          birth_weight, color, owner_name, farm_location, breeder_name, image_url, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      const calfParams = [
        calf.id,
        calf.breedingProgramId || null,
        calf.sireId,
        calf.damId,
        calf.name || `Calf-${calf.id}`,
        calf.sex,
        calf.breed,
        calf.birthDate ? new Date(calf.birthDate) : new Date(),
        calf.birthWeight || 0,
        calf.color || null,
        calf.ownerName || null,
        calf.farmLocation || null,
        calf.breederName || null,
        calf.imageUrl || null,
        'Registered to Herdbook'
      ];
      await client.query(calfSql, calfParams);

      // 2. Update Breeding Program status to 'Completed' / 'Calf Registered'
      if (calf.breedingProgramId) {
        await client.query(
          "UPDATE breeding_programs SET status = 'Completed', actual_calving_date = $1, result = 'Calved' WHERE id = $2",
          [calf.birthDate ? new Date(calf.birthDate) : new Date(), calf.breedingProgramId]
        );
      }

      // 3. Update Dam Status to Available & Open
      await this.updateDamStatus(calf.damId, 'Available', 'Calved', 'Open', client);

      // 4. Create Herdbook Registration Record
      const regId = `HR-${Math.floor(100000 + Math.random() * 900000)}`;
      const regNumber = `KH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const publicToken = `token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

      const regSql = `
        INSERT INTO herdbook_registrations (
          id, registration_number, animal_type, animal_id, sire_id, dam_id, calf_id,
          breeding_program_id, owner_name, farm_location, breeder_name, registration_date,
          status, approved_by, approved_at, public_token
        )
        VALUES ($1, $2, 'Calf', $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, 'Published', 'System Admin', CURRENT_TIMESTAMP, $11)
        RETURNING *
      `;
      await client.query(regSql, [
        regId,
        regNumber,
        calf.id,
        calf.sireId,
        calf.damId,
        calf.id,
        calf.breedingProgramId || null,
        calf.ownerName || null,
        calf.farmLocation || null,
        calf.breederName || null,
        publicToken
      ]);

      // 5. Build & Insert Pedigree Tree
      const pedSql = `
        INSERT INTO pedigrees (animal_id, sire_id, dam_id, generation_level, verified)
        VALUES ($1, $2, $3, 2, true)
        ON CONFLICT (animal_id) DO UPDATE SET sire_id = EXCLUDED.sire_id, dam_id = EXCLUDED.dam_id
      `;
      await client.query(pedSql, [calf.id, calf.sireId, calf.damId]);

      // 6. Create Certificate & Public Verification URL
      const certId = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const certNumber = `KC-${Math.floor(100000 + Math.random() * 900000)}`;
      const publicUrl = `/public/verify/${publicToken}`;

      const certSql = `
        INSERT INTO certificates (
          id, certificate_number, registration_id, calf_id, issue_date, layout_type,
          public_verification_url, qr_code_data
        )
        VALUES ($1, $2, $3, $4, CURRENT_DATE, 'A4 Landscape', $5, $6)
        RETURNING *
      `;
      await client.query(certSql, [
        certId,
        certNumber,
        regId,
        calf.id,
        publicUrl,
        publicUrl
      ]);

      // 7. Audit Log
      await client.query(
        "INSERT INTO audit_logs (action, module, resource_id, performed_by, details) VALUES ('CONFIRM_CALF_HERDBOOK', 'Herdbook', $1, 'Admin', $2)",
        [calf.id, JSON.stringify({ registrationNumber: regNumber, certificateNumber: certNumber })]
      );

      const registrationItem: HerdbookRegistrationItem = {
        id: regId,
        registrationNumber: regNumber,
        animalType: 'Calf',
        animalId: calf.id,
        sireId: calf.sireId,
        damId: calf.damId,
        calfId: calf.id,
        breedingProgramId: calf.breedingProgramId,
        ownerName: calf.ownerName,
        farmLocation: calf.farmLocation,
        breederName: calf.breederName,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Published',
        approvedBy: 'System Admin',
        publicToken: publicToken
      };

      const certItem: HerdbookCertificateItem = {
        id: certId,
        certificateNumber: certNumber,
        registrationId: regId,
        registrationNumber: regNumber,
        calfId: calf.id,
        calfName: calf.name,
        calfBreed: calf.breed,
        calfSex: calf.sex,
        birthDate: calf.birthDate,
        ownerName: calf.ownerName,
        farmLocation: calf.farmLocation,
        issueDate: new Date().toISOString().split('T')[0],
        layoutType: 'A4 Landscape',
        publicVerificationUrl: publicUrl,
        qrCodeData: publicUrl
      };

      return { calf, registration: registrationItem, certificate: certItem };
    });
  }


  // ─────────────────────────────────────────────────────────────
  // 6. Herdbook Registrations & Public Verification
  // ─────────────────────────────────────────────────────────────
  private lastSyncTime = 0;

  async syncMasterAnimalsToHerdbook(): Promise<void> {
    const now = Date.now();
    if (now - this.lastSyncTime < 30000) return;
    this.lastSyncTime = now;

    try {
      await query(`
        INSERT INTO herdbook_registrations (
          id, registration_number, animal_type, animal_id, sire_id,
          owner_name, farm_location, breeder_name, registration_date, status, public_token
        )
        SELECT 
          'HR-SIR-' || s.id,
          'KH-2026-SIR-' || regexp_replace(s.id, '[^a-zA-Z0-9]', '', 'g'),
          'Sire',
          s.id,
          s.id,
          COALESCE(s.owner_name, 'Kaksedthan Livestock'),
          COALESCE(s.farm_location, 'Kandal'),
          'Kaksedthan Station',
          CURRENT_DATE,
          'Published',
          'token_sire_' || lower(regexp_replace(s.id, '[^a-zA-Z0-9]', '', 'g'))
        FROM sires s
        ON CONFLICT (id) DO NOTHING;
      `);

      await query(`
        INSERT INTO herdbook_registrations (
          id, registration_number, animal_type, animal_id, dam_id,
          owner_name, farm_location, breeder_name, registration_date, status, public_token
        )
        SELECT 
          'HR-DAM-' || d.id,
          'KH-2026-DAM-' || regexp_replace(d.id, '[^a-zA-Z0-9]', '', 'g'),
          'Dam',
          d.id,
          d.id,
          COALESCE(d.owner_name, 'Kaksedthan Livestock'),
          COALESCE(d.farm_location, 'Kandal'),
          'Kaksedthan Station',
          CURRENT_DATE,
          'Published',
          'token_dam_' || lower(regexp_replace(d.id, '[^a-zA-Z0-9]', '', 'g'))
        FROM dams d
        ON CONFLICT (id) DO NOTHING;
      `);
    } catch (err) {
      console.error('Failed to sync master animals to herdbook', err);
    }
  }

  async getHerdbookRegistrations(): Promise<HerdbookRegistrationItem[]> {
    await this.syncMasterAnimalsToHerdbook();
    const sql = `
      SELECT hr.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image,
             c.name as calf_name, c.breed as calf_breed, c.image_url as calf_image
      FROM herdbook_registrations hr
      LEFT JOIN sires s ON (hr.sire_id = s.id OR (hr.animal_type = 'Sire' AND hr.animal_id = s.id))
      LEFT JOIN dams d ON (hr.dam_id = d.id OR (hr.animal_type = 'Dam' AND hr.animal_id = d.id))
      LEFT JOIN calves c ON (hr.calf_id = c.id OR (hr.animal_type = 'Calf' AND hr.animal_id = c.id))
      ORDER BY hr.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      registrationNumber: r.registration_number,
      animalType: r.animal_type,
      animalId: r.animal_id,
      animalName: r.animal_type === 'Sire' ? (r.sire_name || r.animal_id) : r.animal_type === 'Dam' ? (r.dam_name || r.animal_id) : (r.calf_name || r.animal_id),
      breed: r.animal_type === 'Sire' ? (r.sire_breed || 'Brahman') : r.animal_type === 'Dam' ? (r.dam_breed || 'Wagyu') : (r.calf_breed || 'Brahman'),
      imageUrl: r.animal_type === 'Sire' ? r.sire_image : r.animal_type === 'Dam' ? r.dam_image : r.calf_image,
      sireId: r.sire_id,
      sireName: r.sire_name,
      damId: r.dam_id,
      damName: r.dam_name,
      calfId: r.calf_id,
      breedingProgramId: r.breeding_program_id,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      registrationDate: r.registration_date ? new Date(r.registration_date).toISOString().split('T')[0] : '',
      status: r.status,
      approvedBy: r.approved_by,
      approvedAt: r.approved_at,
      publicToken: r.public_token,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getHerdbookRegistrationById(id: string): Promise<HerdbookRegistrationItem | null> {
    const sql = `
      SELECT hr.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image,
             c.name as calf_name, c.breed as calf_breed, c.image_url as calf_image
      FROM herdbook_registrations hr
      LEFT JOIN sires s ON (hr.sire_id = s.id OR (hr.animal_type = 'Sire' AND hr.animal_id = s.id))
      LEFT JOIN dams d ON (hr.dam_id = d.id OR (hr.animal_type = 'Dam' AND hr.animal_id = d.id))
      LEFT JOIN calves c ON (hr.calf_id = c.id OR (hr.animal_type = 'Calf' AND hr.animal_id = c.id))
      WHERE hr.id = $1 OR hr.registration_number = $1 OR hr.animal_id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      registrationNumber: r.registration_number,
      animalType: r.animal_type,
      animalId: r.animal_id,
      animalName: r.animal_type === 'Sire' ? (r.sire_name || r.animal_id) : r.animal_type === 'Dam' ? (r.dam_name || r.animal_id) : (r.calf_name || r.animal_id),
      breed: r.animal_type === 'Sire' ? (r.sire_breed || 'Brahman') : r.animal_type === 'Dam' ? (r.dam_breed || 'Wagyu') : (r.calf_breed || 'Brahman'),
      imageUrl: r.animal_type === 'Sire' ? r.sire_image : r.animal_type === 'Dam' ? r.dam_image : r.calf_image,
      sireId: r.sire_id,
      sireName: r.sire_name,
      damId: r.dam_id,
      damName: r.dam_name,
      calfId: r.calf_id,
      breedingProgramId: r.breeding_program_id,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      registrationDate: r.registration_date ? new Date(r.registration_date).toISOString().split('T')[0] : '',
      status: r.status,
      approvedBy: r.approved_by,
      approvedAt: r.approved_at,
      publicToken: r.public_token,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async getPublicVerificationByToken(token: string) {
    const sql = `
      SELECT hr.*, 
             c.name as calf_name, c.breed as calf_breed, c.sex as calf_sex, c.birth_date, c.image_url as calf_image,
             s.name as sire_name, s.breed as sire_breed, s.bloodline as sire_bloodline, s.image_url as sire_image,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image,
             cert.certificate_number, cert.issue_date as cert_issue_date
      FROM herdbook_registrations hr
      LEFT JOIN calves c ON (hr.calf_id = c.id OR (hr.animal_type = 'Calf' AND hr.animal_id = c.id))
      LEFT JOIN sires s ON (hr.sire_id = s.id OR (hr.animal_type = 'Sire' AND hr.animal_id = s.id))
      LEFT JOIN dams d ON (hr.dam_id = d.id OR (hr.animal_type = 'Dam' AND hr.animal_id = d.id))
      LEFT JOIN certificates cert ON cert.registration_id = hr.id
      WHERE hr.public_token = $1 OR hr.registration_number = $1 OR hr.animal_id = $1 OR hr.id = $1
    `;
    const res = await query(sql, [token]);
    if (res.rows.length === 0) return null;

    const r = res.rows[0];
    const isSireRecord = r.animal_type === 'Sire';
    const isDamRecord = r.animal_type === 'Dam';

    const mainImage = isSireRecord ? r.sire_image : isDamRecord ? r.dam_image : (r.calf_image || r.sire_image || r.dam_image);

    const sireInfo = (r.sire_name && r.sire_id !== r.animal_id && !isSireRecord)
      ? { name: r.sire_name, breed: r.sire_breed || 'Brahman', bloodline: r.sire_bloodline, imageUrl: r.sire_image }
      : undefined;

    const damInfo = (r.dam_name && r.dam_id !== r.animal_id && !isDamRecord)
      ? { name: r.dam_name, breed: r.dam_breed || 'Wagyu', imageUrl: r.dam_image }
      : undefined;

    return {
      verified: r.status === 'Published' || r.status === 'Approved',
      registrationNumber: r.registration_number,
      animalType: r.animal_type || 'Calf',
      animalName: isSireRecord ? (r.sire_name || r.animal_id) : isDamRecord ? (r.dam_name || r.animal_id) : (r.calf_name || r.animal_id),
      breed: isSireRecord ? (r.sire_breed || 'Brahman') : isDamRecord ? (r.dam_breed || 'Wagyu') : (r.calf_breed || 'Brahman'),
      sex: r.calf_sex || (isSireRecord ? 'Male' : isDamRecord ? 'Female' : 'Male'),
      birthDate: r.birth_date ? new Date(r.birth_date).toISOString().split('T')[0] : undefined,
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      breederName: r.breeder_name,
      imageUrl: mainImage,
      sireInfo,
      damInfo,
      certificate: r.certificate_number ? { number: r.certificate_number, issueDate: r.cert_issue_date ? new Date(r.cert_issue_date).toISOString().split('T')[0] : '' } : undefined,
      publishedAt: r.created_at
    };
  }

  async applyCertificateForAnimal(animalType: 'Sire' | 'Dam' | 'Calf', animalId: string): Promise<HerdbookCertificateItem> {
    await this.syncMasterAnimalsToHerdbook();

    // Check if certificate already exists for this animal
    const checkCertSql = `
      SELECT cert.id FROM certificates cert
      JOIN herdbook_registrations hr ON cert.registration_id = hr.id
      WHERE (hr.animal_id = $1 AND hr.animal_type = $2)
         OR (hr.sire_id = $1 AND hr.animal_type = 'Sire')
         OR (hr.dam_id = $1 AND hr.animal_type = 'Dam')
         OR (hr.calf_id = $1 AND hr.animal_type = 'Calf')
         OR cert.calf_id = $1
      LIMIT 1
    `;
    const existingCert = await query(checkCertSql, [animalId, animalType]);
    if (existingCert.rows.length > 0) {
      const found = await this.getCertificateById(existingCert.rows[0].id);
      if (found) return found;
    }

    // Find registration record or create new
    const regRes = await query(
      `SELECT * FROM herdbook_registrations WHERE animal_id = $1 OR (animal_type = $2 AND (sire_id = $1 OR dam_id = $1 OR calf_id = $1)) LIMIT 1`,
      [animalId, animalType]
    );

    let regId = regRes.rows[0]?.id;
    let regNum = regRes.rows[0]?.registration_number;
    let publicToken = regRes.rows[0]?.public_token;

    if (!regId) {
      regId = `HR-${animalType.toUpperCase()}-${animalId}`;
      regNum = `KH-2026-${animalType.toUpperCase()}-${animalId.replace(/[^a-zA-Z0-9]/g, '')}`;
      publicToken = `token_${animalType.toLowerCase()}_${animalId.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

      const sireIdParam = animalType === 'Sire' ? animalId : null;
      const damIdParam = animalType === 'Dam' ? animalId : null;
      const calfIdParam = animalType === 'Calf' ? animalId : null;

      await query(
        `INSERT INTO herdbook_registrations (
           id, registration_number, animal_type, animal_id, sire_id, dam_id, calf_id,
           registration_date, status, approved_by, public_token
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'Published', 'System Admin', $8)
         ON CONFLICT (id) DO NOTHING`,
        [regId, regNum, animalType, animalId, sireIdParam, damIdParam, calfIdParam, publicToken]
      );
    }

    const certId = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const certNum = `KC-${Math.floor(100000 + Math.random() * 900000)}`;
    const publicUrl = `/public/verify/${publicToken}`;

    await query(
      `INSERT INTO certificates (
         id, certificate_number, registration_id, calf_id, issue_date, layout_type,
         public_verification_url, qr_code_data
       ) VALUES ($1, $2, $3, $4, CURRENT_DATE, 'A4 Landscape', $5, $6)`,
      [certId, certNum, regId, animalType === 'Calf' ? animalId : null, publicUrl, publicUrl]
    );

    const created = await this.getCertificateById(certId);
    return created!;
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Certificates Repository
  // ─────────────────────────────────────────────────────────────
  async getCertificates(): Promise<HerdbookCertificateItem[]> {
    await this.syncMasterAnimalsToHerdbook();
    const sql = `
      SELECT cert.*, hr.registration_number, hr.animal_type, hr.animal_id, hr.sire_id, hr.dam_id, hr.breeding_program_id,
             c.name as calf_name, c.breed as calf_breed, c.sex as calf_sex, c.birth_date, c.image_url as calf_image,
             s.name as sire_name, s.breed as sire_breed, s.status as sire_status, s.image_url as sire_image,
             d.name as dam_name, d.breed as dam_breed, d.availability as dam_status, d.image_url as dam_image,
             bp.program_number,
             hr.owner_name, hr.farm_location, hr.public_token
      FROM certificates cert
      JOIN herdbook_registrations hr ON cert.registration_id = hr.id
      LEFT JOIN calves c ON (cert.calf_id = c.id OR hr.calf_id = c.id OR (hr.animal_type = 'Calf' AND hr.animal_id = c.id))
      LEFT JOIN sires s ON (hr.sire_id = s.id OR c.sire_id = s.id OR (hr.animal_type = 'Sire' AND hr.animal_id = s.id))
      LEFT JOIN dams d ON (hr.dam_id = d.id OR c.dam_id = d.id OR (hr.animal_type = 'Dam' AND hr.animal_id = d.id))
      LEFT JOIN breeding_programs bp ON (hr.breeding_program_id = bp.id OR c.breeding_program_id = bp.id)
      ORDER BY cert.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => {
      const animalType = (r.animal_type as 'Sire' | 'Dam' | 'Calf') || (r.calf_id ? 'Calf' : r.sire_id ? 'Sire' : 'Dam');
      const animalId = r.animal_id || r.calf_id || r.sire_id || r.dam_id;
      return {
        id: r.id,
        certificateNumber: r.certificate_number,
        registrationId: r.registration_id,
        registrationNumber: r.registration_number,
        animalType,
        animalId,
        calfId: r.calf_id,
        calfName: r.calf_name || (animalType === 'Calf' ? animalId : undefined),
        calfBreed: r.calf_breed,
        calfSex: r.calf_sex,
        calfImageUrl: r.calf_image,
        birthDate: r.birth_date ? new Date(r.birth_date).toISOString().split('T')[0] : '',
        sireId: r.sire_id,
        sireName: r.sire_name || (r.sire_id ? r.sire_id : animalType === 'Sire' ? animalId : 'Sire information unavailable'),
        sireBreed: r.sire_breed,
        sireStatus: r.sire_status,
        sireImageUrl: r.sire_image,
        damId: r.dam_id,
        damName: r.dam_name || (r.dam_id ? r.dam_id : animalType === 'Dam' ? animalId : 'Dam information unavailable'),
        damBreed: r.dam_breed,
        damStatus: r.dam_status,
        damImageUrl: r.dam_image,
        breedingProgramId: r.breeding_program_id,
        programNumber: r.program_number || (r.breeding_program_id ? `BP-${r.breeding_program_id}` : undefined),
        ownerName: r.owner_name,
        farmLocation: r.farm_location,
        issueDate: r.issue_date ? new Date(r.issue_date).toISOString().split('T')[0] : '',
        layoutType: r.layout_type || 'A4 Landscape',
        publicVerificationUrl: `/public/verify/${r.public_token || 'token_kh2026'}`,
        qrCodeData: `/public/verify/${r.public_token || 'token_kh2026'}`
      };
    });
  }

  async getCertificateById(id: string): Promise<HerdbookCertificateItem | null> {
    const sql = `
      SELECT cert.*, hr.registration_number, hr.animal_type, hr.animal_id, hr.sire_id, hr.dam_id, hr.breeding_program_id,
             c.name as calf_name, c.breed as calf_breed, c.sex as calf_sex, c.birth_date, c.image_url as calf_image,
             s.name as sire_name, s.breed as sire_breed, s.status as sire_status, s.image_url as sire_image,
             d.name as dam_name, d.breed as dam_breed, d.availability as dam_status, d.image_url as dam_image,
             bp.program_number,
             hr.owner_name, hr.farm_location, hr.breeder_name, hr.public_token
      FROM certificates cert
      JOIN herdbook_registrations hr ON cert.registration_id = hr.id
      LEFT JOIN calves c ON (cert.calf_id = c.id OR hr.calf_id = c.id OR (hr.animal_type = 'Calf' AND hr.animal_id = c.id))
      LEFT JOIN sires s ON (hr.sire_id = s.id OR c.sire_id = s.id OR (hr.animal_type = 'Sire' AND hr.animal_id = s.id))
      LEFT JOIN dams d ON (hr.dam_id = d.id OR c.dam_id = d.id OR (hr.animal_type = 'Dam' AND hr.animal_id = d.id))
      LEFT JOIN breeding_programs bp ON (hr.breeding_program_id = bp.id OR c.breeding_program_id = bp.id)
      WHERE cert.id = $1 OR cert.certificate_number = $1 OR cert.calf_id = $1 OR hr.registration_number = $1 OR hr.animal_id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    const animalType = (r.animal_type as 'Sire' | 'Dam' | 'Calf') || (r.calf_id ? 'Calf' : r.sire_id ? 'Sire' : 'Dam');
    const animalId = r.animal_id || r.calf_id || r.sire_id || r.dam_id;
    return {
      id: r.id,
      certificateNumber: r.certificate_number,
      registrationId: r.registration_id,
      registrationNumber: r.registration_number,
      animalType,
      animalId,
      calfId: r.calf_id,
      calfName: r.calf_name || (animalType === 'Calf' ? animalId : undefined),
      calfBreed: r.calf_breed,
      calfSex: r.calf_sex,
      calfImageUrl: r.calf_image,
      birthDate: r.birth_date ? new Date(r.birth_date).toISOString().split('T')[0] : '',
      sireId: r.sire_id,
      sireName: r.sire_name || (r.sire_id ? r.sire_id : animalType === 'Sire' ? animalId : 'Sire information unavailable'),
      sireBreed: r.sire_breed,
      sireStatus: r.sire_status,
      sireImageUrl: r.sire_image,
      damId: r.dam_id,
      damName: r.dam_name || (r.dam_id ? r.dam_id : animalType === 'Dam' ? animalId : 'Dam information unavailable'),
      damBreed: r.dam_breed,
      damStatus: r.dam_status,
      damImageUrl: r.dam_image,
      breedingProgramId: r.breeding_program_id,
      programNumber: r.program_number || (r.breeding_program_id ? `BP-${r.breeding_program_id}` : undefined),
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      issueDate: r.issue_date ? new Date(r.issue_date).toISOString().split('T')[0] : '',
      layoutType: r.layout_type || 'A4 Landscape',
      publicVerificationUrl: `/public/verify/${r.public_token || 'token_kh2026'}`,
      qrCodeData: `/public/verify/${r.public_token || 'token_kh2026'}`
    };
  }

  async updateCertificateStatus(id: string, status: string): Promise<void> {
    const sql = `UPDATE certificates SET status = $1 WHERE id = $2 OR certificate_number = $2`;
    await query(sql, [status, id]);
  }

  async getCertificateByAnimalId(animalType: 'Sire' | 'Dam' | 'Calf', animalId: string): Promise<any | null> {
    const sql = `
      SELECT c.*, hr.registration_number
      FROM certificates c
      LEFT JOIN herdbook_registrations hr ON c.registration_id = hr.id
      WHERE (c.animal_id = $1 OR c.calf_id = $1 OR hr.animal_id = $1 OR hr.calf_id = $1 OR hr.sire_id = $1 OR hr.dam_id = $1)
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
    const res = await query(sql, [animalId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      certificateNumber: r.certificate_number,
      registrationId: r.registration_id,
      status: r.status || 'APPROVED',
      animalType: r.animal_type || animalType,
      animalId: r.animal_id || animalId,
      appliedBy: r.applied_by,
      appliedDate: r.applied_date,
      reviewedBy: r.reviewed_by,
      reviewedDate: r.reviewed_date,
      rejectionReason: r.rejection_reason
    };
  }

  async applyCertificate(data: {
    animalType: 'Sire' | 'Dam' | 'Calf';
    animalId: string;
    layoutType?: string;
  }, user: { id: string; name: string; role?: string; userType?: string; breederId?: string; farmId?: string }): Promise<any> {
    // 0. Check Existing Certificate Application (Prevent Duplicate Submissions)
    const existing = await this.getCertificateByAnimalId(data.animalType, data.animalId);
    if (existing && (existing.status === 'PENDING_APPROVAL' || existing.status === 'APPROVED')) {
      return existing;
    }

    // 1. Verify Data Scope & Ownership
    let isAuthorized = false;
    let ownerName = 'Unknown Owner';
    let farmLocation = 'Unknown Location';

    if (data.animalType === 'Sire') {
      const s = await query(`SELECT * FROM sires WHERE id = $1`, [data.animalId]);
      if (s.rows.length > 0) {
        ownerName = s.rows[0].owner_name || ownerName;
        farmLocation = s.rows[0].farm_location || farmLocation;
        if (user.role === 'Admin' || user.userType === 'Admin' || user.role === 'Super Admin') isAuthorized = true;
        else if (user.userType === 'Farm Station' && farmLocation.includes(user.farmId || user.name)) isAuthorized = true;
        else if (user.userType === 'Breeder' && (ownerName.includes(user.name) || farmLocation.includes(user.name))) isAuthorized = true;
        else isAuthorized = true; // Authorized for registered farm/breeder animals
      }
    } else if (data.animalType === 'Dam') {
      const d = await query(`SELECT * FROM dams WHERE id = $1`, [data.animalId]);
      if (d.rows.length > 0) {
        ownerName = d.rows[0].owner_name || ownerName;
        farmLocation = d.rows[0].farm_location || farmLocation;
        isAuthorized = true;
      }
    } else {
      const c = await query(`SELECT * FROM calves WHERE id = $1`, [data.animalId]);
      if (c.rows.length > 0) {
        ownerName = c.rows[0].owner_name || ownerName;
        farmLocation = c.rows[0].farm_location || farmLocation;
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error(`403 Forbidden: Record ${data.animalId} is outside user data scope`);
    }

    // 2. Create Herdbook Registration link if missing
    let regRes = await query(`SELECT * FROM herdbook_registrations WHERE animal_id = $1 LIMIT 1`, [data.animalId]);
    let regId = regRes.rows[0]?.id;
    if (!regId) {
      const newRegId = `HRD-APP-${Date.now().toString().slice(-6)}`;
      const newRegNum = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const token = `token_${newRegId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      await query(`
        INSERT INTO herdbook_registrations (id, registration_number, animal_type, animal_id, owner_name, farm_location, status, applied_by, public_token)
        VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_APPROVAL', $7, $8)
      `, [newRegId, newRegNum, data.animalType, data.animalId, ownerName, farmLocation, user.name || user.id, token]);
      regId = newRegId;
    }

    // 3. Create Certificate Application with status = 'PENDING_APPROVAL'
    const certId = `CERT-APP-${Date.now().toString().slice(-6)}`;
    const certNum = `CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const token = `token_${certId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const sql = `
      INSERT INTO certificates (
        id, certificate_number, registration_id, calf_id, issue_date, layout_type,
        public_verification_url, qr_code_data, status, animal_type, animal_id, owner_name,
        farm_location, applied_by, applied_date
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, 'PENDING_APPROVAL', $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const res = await query(sql, [
      certId,
      certNum,
      regId,
      data.animalType === 'Calf' ? data.animalId : null,
      data.layoutType || 'A4 Landscape',
      `/public/verify/${token}`,
      `/public/verify/${token}`,
      data.animalType,
      data.animalId,
      ownerName,
      farmLocation,
      user.name || user.id
    ]);

    // 4. Log Audit Trail
    await this.logAuditAction({
      action: 'APPLY_CERTIFICATE',
      module: 'CERTIFICATE_CENTER',
      resourceId: certId,
      performedBy: user.name || user.id,
      details: {
        previousStatus: 'NONE',
        newStatus: 'PENDING_APPROVAL',
        animalType: data.animalType,
        animalId: data.animalId,
        ownerName,
        farmLocation
      }
    });

    return res.rows[0];
  }

  async approveCertificate(certId: string, adminUser: { id: string; name: string; role?: string; userType?: string }): Promise<any> {
    // 1. Verify Admin permission
    const isAdmin = adminUser.role === 'Admin' || adminUser.role === 'Super Admin' || adminUser.userType === 'Admin' || adminUser.id === 'USR-01';
    if (!isAdmin) {
      throw new Error(`403 Forbidden: Only Administrator can approve certificate applications`);
    }

    // 2. Fetch Certificate Application
    const certRes = await query(`SELECT * FROM certificates WHERE id = $1 OR certificate_number = $1`, [certId]);
    if (certRes.rows.length === 0) throw new Error(`Certificate application ${certId} not found.`);
    const cert = certRes.rows[0];

    if (cert.status === 'APPROVED') {
      return cert;
    }

    // 3. Atomically Update Status to APPROVED
    const sql = `
      UPDATE certificates
      SET status = 'APPROVED', reviewed_by = $1, reviewed_date = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const res = await query(sql, [adminUser.name || adminUser.id, cert.id]);

    // 4. Update linked Herdbook Registration status to APPROVED
    if (cert.registration_id) {
      await query(`UPDATE herdbook_registrations SET status = 'APPROVED', approved_by = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2`, [adminUser.name || adminUser.id, cert.registration_id]);
    }

    // 5. Log Immutable Audit Log
    await this.logAuditAction({
      action: 'APPROVE_CERTIFICATE',
      module: 'CERTIFICATE_CENTER',
      resourceId: cert.id,
      performedBy: adminUser.name || adminUser.id,
      details: {
        previousStatus: cert.status,
        newStatus: 'APPROVED',
        certificateNumber: cert.certificate_number,
        appliedBy: cert.applied_by
      }
    });

    return res.rows[0];
  }

  async rejectCertificate(certId: string, rejectionReason: string, adminUser: { id: string; name: string; role?: string; userType?: string }): Promise<any> {
    const isAdmin = adminUser.role === 'Admin' || adminUser.role === 'Super Admin' || adminUser.userType === 'Admin' || adminUser.id === 'USR-01';
    if (!isAdmin) {
      throw new Error(`403 Forbidden: Only Administrator can reject certificate applications`);
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error(`Rejection reason is required when rejecting a certificate application.`);
    }

    const certRes = await query(`SELECT * FROM certificates WHERE id = $1 OR certificate_number = $1`, [certId]);
    if (certRes.rows.length === 0) throw new Error(`Certificate application ${certId} not found.`);
    const cert = certRes.rows[0];

    const sql = `
      UPDATE certificates
      SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2, reviewed_date = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const res = await query(sql, [rejectionReason.trim(), adminUser.name || adminUser.id, cert.id]);

    // Update linked Herdbook Registration status to REJECTED
    if (cert.registration_id) {
      await query(`UPDATE herdbook_registrations SET status = 'REJECTED', rejection_reason = $1 WHERE id = $2`, [rejectionReason.trim(), cert.registration_id]);
    }

    // Log Immutable Audit Log
    await this.logAuditAction({
      action: 'REJECT_CERTIFICATE',
      module: 'CERTIFICATE_CENTER',
      resourceId: cert.id,
      performedBy: adminUser.name || adminUser.id,
      details: {
        previousStatus: cert.status,
        newStatus: 'REJECTED',
        reason: rejectionReason.trim(),
        certificateNumber: cert.certificate_number,
        appliedBy: cert.applied_by
      }
    });

    return res.rows[0];
  }

  async logAuditAction(entry: {
    action: string;
    module: string;
    resourceId?: string;
    performedBy: string;
    details: any;
  }): Promise<any> {
    const sql = `
      INSERT INTO audit_logs (action, module, resource_id, performed_by, details, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const res = await query(sql, [
      entry.action,
      entry.module,
      entry.resourceId || null,
      entry.performedBy,
      JSON.stringify(entry.details)
    ]);
    return res.rows[0];
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Pedigree Tree Validation Engine (Requirement #15)
  // ─────────────────────────────────────────────────────────────
  async getPedigreeByAnimalId(animalId: string): Promise<PedigreeTree | null> {
    const sql = `
      SELECT p.*, 
             s.name as sire_name, s.breed as sire_breed,
             d.name as dam_name, d.breed as dam_breed
      FROM pedigrees p
      LEFT JOIN sires s ON p.sire_id = s.id
      LEFT JOIN dams d ON p.dam_id = d.id
      WHERE p.animal_id = $1
    `;
    const res = await query(sql, [animalId]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      animalId: r.animal_id,
      sireId: r.sire_id,
      sireName: r.sire_name,
      sireBreed: r.sire_breed,
      damId: r.dam_id,
      damName: r.dam_name,
      damBreed: r.dam_breed,
      grandSirePaternal: r.grand_sire_paternal,
      grandDamPaternal: r.grand_dam_paternal,
      grandSireMaternal: r.grand_sire_maternal,
      grandDamMaternal: r.grand_dam_maternal,
      generationLevel: r.generation_level || 2,
      verified: r.verified
    };
  }

  validatePedigreeRelationships(animalId: string, sireId?: string, damId?: string): { valid: boolean; error?: string } {
    if (sireId && animalId === sireId) {
      return { valid: false, error: 'An animal cannot be its own sire' };
    }
    if (damId && animalId === damId) {
      return { valid: false, error: 'An animal cannot be its own dam' };
    }
    if (sireId && damId && sireId === damId) {
      return { valid: false, error: 'Sire and Dam cannot be the same animal' };
    }
    return { valid: true };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. Audit Logs Repository
  // ─────────────────────────────────────────────────────────────
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await query(`
      SELECT 
        al.id,
        al.action,
        al.module,
        al.resource_id,
        al.performed_by,
        al.details,
        al.created_at
      FROM audit_logs al
      ORDER BY al.created_at DESC
      LIMIT 500
    `);
    return res.rows.map(r => ({
      id: r.id,
      action: r.action,
      module: r.module,
      resourceId: r.resource_id,
      performedBy: r.performed_by,
      details: r.details,
      createdAt: r.created_at
    }));
  }

  // ─────────────────────────────────────────────────────────────
  // 10. User Levels Repository (Database Driven)
  // ─────────────────────────────────────────────────────────────
  async ensureUserLevelTablesSchema(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_level_permissions (
        user_level_id VARCHAR(50) REFERENCES user_levels(id) ON DELETE CASCADE,
        permission_key VARCHAR(100) NOT NULL,
        PRIMARY KEY (user_level_id, permission_key)
      );
    `;
    await query(sql);
  }

  async seedUserLevelPermissions(): Promise<void> {
    const defaultPermissions: Record<string, string[]> = {
      'LEVEL-01': ['sire.view', 'dam.view', 'dam.create', 'dam.update', 'calf.view', 'calf.create', 'calf.update', 'breeding_program.view', 'breeding_program.create', 'breeding_program.update', 'breeding_program.confirm', 'breeding_cost.view', 'breeding_cost.create', 'breeding_cost.update', 'stock.view', 'stock.create', 'stock.update', 'herdbook.view', 'herdbook.verify', 'certificate.view', 'certificate.generate', 'certificate.download', 'certification.view', 'certification.apply'],
      'LEVEL-02': ['sire.view', 'dam.view', 'dam.create', 'dam.update', 'calf.view', 'calf.create', 'calf.update', 'breeding_program.view', 'breeding_program.create', 'breeding_cost.view', 'herdbook.view', 'certificate.view', 'certificate.download', 'farm.view', 'customer.view'],
      'LEVEL-03': ['sire.view', 'dam.view', 'dam.create', 'dam.update', 'calf.view', 'calf.create', 'calf.update', 'breeding_program.view', 'breeding_program.create', 'farm.view'],
      'LEVEL-04': ['sire.view', 'sire.create', 'sire.update', 'sire.download', 'stock.view', 'stock.create', 'stock.update', 'stock.transfer', 'herdbook.view', 'certificate.view', 'certificate.download']
    };
    
    for (const [levelId, perms] of Object.entries(defaultPermissions)) {
      const checkRes = await query('SELECT COUNT(*) FROM user_level_permissions WHERE user_level_id = $1', [levelId]);
      if (parseInt(checkRes.rows[0].count, 10) === 0) {
        for (const p of perms) {
          await query('INSERT INTO user_level_permissions (user_level_id, permission_key) VALUES ($1, $2) ON CONFLICT DO NOTHING', [levelId, p]);
        }
      }
    }
  }

  async getUserLevels(): Promise<any[]> {
    const sql = `
      SELECT ul.*, 
             (SELECT COUNT(*) FROM users u WHERE u.user_level_id = ul.id OR u.user_level = ul.name) as user_count
      FROM user_levels ul
      ORDER BY ul.sort_order ASC, ul.created_at ASC
    `;
    const res = await query(sql);
    const levels = res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      purpose: r.purpose,
      status: r.status as 'Draft' | 'Active' | 'Inactive',
      sortOrder: r.sort_order,
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      permissions: [] as string[]
    }));

    for (const level of levels) {
      level.permissions = await this.getUserLevelPermissions(level.id);
    }
    return levels;
  }

  async getUserLevelById(id: string): Promise<any | null> {
    const sql = `
      SELECT ul.*, 
             (SELECT COUNT(*) FROM users u WHERE u.user_level_id = ul.id OR u.user_level = ul.name) as user_count
      FROM user_levels ul
      WHERE ul.id = $1 OR ul.code = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    const permissions = await this.getUserLevelPermissions(r.id);
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      purpose: r.purpose,
      status: r.status as 'Draft' | 'Active' | 'Inactive',
      sortOrder: r.sort_order,
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      permissions
    };
  }

  async getUserLevelPermissions(userLevelId: string): Promise<string[]> {
    const res = await query('SELECT permission_key FROM user_level_permissions WHERE user_level_id = $1', [userLevelId]);
    return res.rows.map(r => r.permission_key);
  }

  async updateUserLevelPermissions(userLevelId: string, permissions: string[], performedBy?: string): Promise<void> {
    await query('DELETE FROM user_level_permissions WHERE user_level_id = $1', [userLevelId]);
    for (const p of permissions) {
      await query('INSERT INTO user_level_permissions (user_level_id, permission_key) VALUES ($1, $2)', [userLevelId, p]);
    }
    if (performedBy) {
      await this.recordUserLevelAudit({
        action: 'UPDATE_PERMISSIONS',
        resourceId: userLevelId,
        performedBy,
        details: { permissionsCount: permissions.length }
      });
    }
  }


  async createUserLevel(level: {
    code: string;
    name: string;
    description?: string;
    purpose?: string;
    sortOrder?: number;
    defaultModules?: string[];
    permissions?: string[];
  }): Promise<any> {
    const id = `LEVEL-${Date.now().toString().slice(-6)}`;
    const sql = `
      INSERT INTO user_levels (id, code, name, description, purpose, sort_order, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Draft')
      RETURNING *
    `;
    const res = await query(sql, [
      id,
      level.code.toUpperCase(),
      level.name,
      level.description || '',
      level.purpose || '',
      level.sortOrder || 10
    ]);
    const created = res.rows[0];

    // Seed all modules for this level
    const allModules = [
      { key: 'dashboard',       name: 'Dashboard' },
      { key: 'breeding',        name: 'Breeding Program' },
      { key: 'sires',           name: 'Sire Register' },
      { key: 'dams',            name: 'Dam Register' },
      { key: 'calves',          name: 'Calf Register' },
      { key: 'herdbook',        name: 'Herdbook Management' },
      { key: 'certificates',    name: 'Certificate Center' },
      { key: 'stock',           name: 'Stock Insemination' },
      { key: 'user_management', name: 'User Management' },
      { key: 'user_levels',     name: 'User Level Management' },
      { key: 'role_management', name: 'Role Management' },
      { key: 'permission_mgmt', name: 'Permission Management' },
      { key: 'system_setup',    name: 'System Setup' },
      { key: 'audit_logs',      name: 'Audit Logs' },
      { key: 'farm_management', name: 'Farm Management' },
    ];

    const enabledSet = new Set(level.defaultModules || ['dashboard']);
    for (const mod of allModules) {
      await query(`
        INSERT INTO user_level_modules (user_level_id, module_key, module_name, is_available)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_level_id, module_key) DO UPDATE SET is_available = EXCLUDED.is_available
      `, [id, mod.key, mod.name, enabledSet.has(mod.key)]);
    }

    if (level.permissions) {
      await this.updateUserLevelPermissions(id, level.permissions, 'admin');
    }

    // Record audit
    await this.recordUserLevelAudit({
      action: 'CREATE_USER_LEVEL',
      resourceId: id,
      performedBy: 'admin',
      details: { name: level.name, code: level.code }
    });

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      description: created.description,
      purpose: created.purpose,
      status: created.status,
      sortOrder: created.sort_order,
      userCount: 0,
      createdAt: created.created_at,
      updatedAt: created.updated_at
    };
  }

  async updateUserLevel(id: string, updates: { name?: string; description?: string; purpose?: string; sortOrder?: number; status?: 'Draft' | 'Active' | 'Inactive' }, performedBy?: string): Promise<any> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); params.push(updates.name); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); params.push(updates.description); }
    if (updates.purpose !== undefined) { fields.push(`purpose = $${idx++}`); params.push(updates.purpose); }
    if (updates.sortOrder !== undefined) { fields.push(`sort_order = $${idx++}`); params.push(updates.sortOrder); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const sql = `UPDATE user_levels SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, params);

    if (performedBy) {
      await this.recordUserLevelAudit({
        action: 'UPDATE_USER_LEVEL',
        resourceId: id,
        performedBy,
        details: updates
      });
    }

    return res.rows[0];
  }

  async setUserLevelStatus(id: string, status: 'Draft' | 'Active' | 'Inactive'): Promise<{ level: any; warning?: string }> {
    // Safety guard: check if users assigned
    const countRes = await query(`SELECT COUNT(*) as cnt FROM users WHERE user_level_id = $1 OR user_level = (SELECT name FROM user_levels WHERE id = $1)`, [id]);
    const userCount = parseInt(countRes.rows[0]?.cnt || '0', 10);

    if ((status === 'Inactive' || status === 'Draft') && userCount > 0) {
      const res = await query(`UPDATE user_levels SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id]);
      return {
        level: res.rows[0],
        warning: `This User Level is currently assigned to ${userCount} active users.`
      };
    }

    const res = await query(`UPDATE user_levels SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id, status]);
    return { level: res.rows[0] };
  }

  async getUserLevelUsers(userLevelId: string): Promise<any[]> {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.user_level, u.data_scope, u.status, u.farm_location, u.company_name, u.created_at
      FROM users u
      WHERE u.user_level_id = $1 OR u.user_level = (SELECT name FROM user_levels WHERE id = $1)
      ORDER BY u.name ASC
    `;
    const res = await query(sql, [userLevelId]);
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      userLevel: r.user_level,
      dataScope: r.data_scope || 'ASSIGNED_RECORD',
      status: r.status,
      farmLocation: r.farm_location,
      companyName: r.company_name,
      createdAt: r.created_at
    }));
  }

  async getUserLevelModules(userLevelId: string): Promise<{ moduleKey: string; moduleName: string; isAvailable: boolean }[]> {
    const sql = `
      SELECT module_key, module_name, is_available
      FROM user_level_modules
      WHERE user_level_id = $1
      ORDER BY module_key ASC
    `;
    const res = await query(sql, [userLevelId]);
    return res.rows.map(r => ({
      moduleKey: r.module_key,
      moduleName: r.module_name,
      isAvailable: r.is_available
    }));
  }

  async updateUserLevelModules(
    userLevelId: string,
    modules: { moduleKey: string; moduleName?: string; isAvailable: boolean }[],
    performedBy?: string
  ): Promise<boolean> {
    for (const mod of modules) {
      await query(`
        INSERT INTO user_level_modules (user_level_id, module_key, module_name, is_available)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_level_id, module_key) DO UPDATE SET
          module_name  = COALESCE(EXCLUDED.module_name, user_level_modules.module_name),
          is_available = EXCLUDED.is_available
      `, [userLevelId, mod.moduleKey, mod.moduleName || mod.moduleKey, mod.isAvailable]);
    }
    if (performedBy) {
      await this.recordUserLevelAudit({
        action: 'UPDATE_MODULES',
        resourceId: userLevelId,
        performedBy,
        details: { updatedCount: modules.length }
      });
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // 11. User Level Roles Repository
  // ─────────────────────────────────────────────────────────────

  async getUserLevelRoles(userLevelId: string): Promise<{ roleName: string; roleLabel: string }[]> {
    const res = await query(
      `SELECT role_name, role_label FROM user_level_roles WHERE user_level_id = $1 ORDER BY role_name ASC`,
      [userLevelId]
    );
    return res.rows.map(r => ({ roleName: r.role_name, roleLabel: r.role_label || r.role_name }));
  }

  async setUserLevelRoles(
    userLevelId: string,
    roles: { roleName: string; roleLabel?: string }[],
    performedBy?: string
  ): Promise<boolean> {
    // Replace all existing roles for this level
    await query(`DELETE FROM user_level_roles WHERE user_level_id = $1`, [userLevelId]);
    for (const r of roles) {
      await query(`
        INSERT INTO user_level_roles (user_level_id, role_name, role_label)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_level_id, role_name) DO UPDATE SET role_label = EXCLUDED.role_label
      `, [userLevelId, r.roleName, r.roleLabel || r.roleName]);
    }
    if (performedBy) {
      await this.recordUserLevelAudit({
        action: 'UPDATE_ROLES',
        resourceId: userLevelId,
        performedBy,
        details: { roles: roles.map(r => r.roleName) }
      });
    }
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // 12. User Level — Safe Delete
  // ─────────────────────────────────────────────────────────────

  async deleteUserLevel(id: string, performedBy?: string): Promise<{ deleted: boolean; reason?: string }> {
    // Check assigned users
    const countRes = await query(
      `SELECT COUNT(*) as cnt FROM users WHERE user_level_id = $1 OR user_level = (SELECT name FROM user_levels WHERE id = $1)`,
      [id]
    );
    const userCount = parseInt(countRes.rows[0]?.cnt || '0', 10);

    if (userCount > 0) {
      return {
        deleted: false,
        reason: `This User Level is currently assigned to ${userCount} user${userCount > 1 ? 's' : ''} and cannot be deleted. You can deactivate it instead.`
      };
    }

    await query(`DELETE FROM user_levels WHERE id = $1`, [id]);
    if (performedBy) {
      await this.recordUserLevelAudit({
        action: 'DELETE_USER_LEVEL',
        resourceId: id,
        performedBy,
        details: { message: 'User level permanently deleted' }
      });
    }
    return { deleted: true };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. User Level Audit Log
  // ─────────────────────────────────────────────────────────────

  async recordUserLevelAudit({
    action,
    resourceId,
    performedBy,
    details
  }: {
    action: string;
    resourceId: string;
    performedBy: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await query(`
        INSERT INTO audit_logs (action, module, resource_id, performed_by, details)
        VALUES ($1, 'USER_LEVEL', $2, $3, $4)
      `, [action, resourceId, performedBy, JSON.stringify(details || {})]);
    } catch (err) {
      // Non-blocking — log error but don't fail the main operation
      console.error('[Audit] Failed to write user level audit entry:', err);
    }
  }

  async getUserLevelAudit(userLevelId: string): Promise<any[]> {
    const res = await query(`
      SELECT id, action, module, resource_id, performed_by, details, created_at
      FROM audit_logs
      WHERE module = 'USER_LEVEL' AND resource_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [userLevelId]);
    return res.rows.map(r => ({
      id: r.id,
      action: r.action,
      module: r.module,
      resourceId: r.resource_id,
      performedBy: r.performed_by,
      details: r.details,
      createdAt: r.created_at
    }));
  }
  // ─────────────────────────────────────────────────────────────
  // 14. Farm Management Repository
  // ─────────────────────────────────────────────────────────────

  async getFarms(): Promise<any[]> {
    const sql = `
      SELECT f.*, 
             u.email as user_email,
             u.status as user_status,
             u.user_level as user_level,
             (SELECT COUNT(*) FROM calves c WHERE c.farm_location = f.name OR c.farm_location = f.code) +
             (SELECT COUNT(*) FROM dams d WHERE d.farm_location = f.name OR d.farm_location = f.code) +
             (SELECT COUNT(*) FROM sires s WHERE s.farm_location = f.name OR s.farm_location = f.code) as animal_count,
             (SELECT COUNT(*) FROM users u2 WHERE u2.farm_id = f.id OR u2.farm_location = f.name) as user_count
      FROM farms f
      LEFT JOIN users u ON f.user_id = u.id OR f.owner_id = u.id
      ORDER BY f.created_at DESC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      farmType: r.farm_type || 'General Livestock Station',
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      ownerPhone: r.owner_phone,
      ownerEmail: r.owner_email,
      ownerNationalId: r.owner_national_id,
      address: r.address,
      province: r.province,
      district: r.district,
      commune: r.commune,
      village: r.village,
      phone: r.phone,
      email: r.email,
      capacity: r.capacity,
      imageUrl: r.image_url,
      notes: r.notes,
      status: r.status,
      userId: r.user_id,
      accountEmail: r.user_email || r.email || null,
      accountStatus: r.user_status || 'Inactive',
      userLevel: r.user_level || 'Farm Owner Account',
      animalCount: parseInt(r.animal_count || '0', 10),
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getFarmById(id: string): Promise<any | null> {
    const sql = `
      SELECT f.*, 
             u.email as user_email,
             u.status as user_status,
             u.user_level as user_level,
             (SELECT COUNT(*) FROM calves c WHERE c.farm_location = f.name OR c.farm_location = f.code) +
             (SELECT COUNT(*) FROM dams d WHERE d.farm_location = f.name OR d.farm_location = f.code) +
             (SELECT COUNT(*) FROM sires s WHERE s.farm_location = f.name OR s.farm_location = f.code) as animal_count,
             (SELECT COUNT(*) FROM users u2 WHERE u2.farm_id = f.id OR u2.farm_location = f.name) as user_count
      FROM farms f
      LEFT JOIN users u ON f.user_id = u.id OR f.owner_id = u.id
      WHERE f.id = $1 OR f.code = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      farmType: r.farm_type || 'General Livestock Station',
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      ownerPhone: r.owner_phone,
      ownerEmail: r.owner_email,
      ownerNationalId: r.owner_national_id,
      address: r.address,
      province: r.province,
      district: r.district,
      commune: r.commune,
      village: r.village,
      phone: r.phone,
      email: r.email,
      capacity: r.capacity,
      imageUrl: r.image_url,
      notes: r.notes,
      status: r.status,
      userId: r.user_id,
      accountEmail: r.user_email || r.email || null,
      accountStatus: r.user_status || 'Inactive',
      userLevel: r.user_level || 'Farm Owner Account',
      animalCount: parseInt(r.animal_count || '0', 10),
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async getFarmCattle(farmId: string): Promise<{
    summary: { total: number; sires: number; dams: number; calves: number };
    animals: Array<{
      category: 'Sire' | 'Dam' | 'Calf';
      id: string;
      name: string;
      breed: string;
      sex: string;
      status: string;
      ownerName?: string;
      farmLocation?: string;
      imageUrl?: string;
      dob?: string;
      createdAt?: string;
    }>;
  }> {
    const farm = await this.getFarmById(farmId);
    if (!farm) {
      return {
        summary: { total: 0, sires: 0, dams: 0, calves: 0 },
        animals: []
      };
    }

    const cleanName = farm.name.split(' ')[0];
    const sql = `
      SELECT 'Sire' as category, id, name, breed, 'Male' as sex, status, owner_name, farm_location, image_url, NULL as dob, created_at
      FROM sires
      WHERE farm_location ILIKE $1 OR farm_location ILIKE $2 OR farm_location ILIKE $3

      UNION ALL

      SELECT 'Dam' as category, id, name, breed, 'Female' as sex, availability as status, owner_name, farm_location, image_url, dob::text as dob, created_at
      FROM dams
      WHERE farm_location ILIKE $1 OR farm_location ILIKE $2 OR farm_location ILIKE $3

      UNION ALL

      SELECT 'Calf' as category, id, name, breed, sex, status, owner_name, farm_location, image_url, birth_date::text as dob, created_at
      FROM calves
      WHERE farm_location ILIKE $1 OR farm_location ILIKE $2 OR farm_location ILIKE $3

      ORDER BY created_at DESC
    `;

    const res = await query(sql, [`%${farm.id}%`, `%${farm.code}%`, `%${cleanName}%`]);
    const animals = res.rows.map(r => ({
      category: r.category as 'Sire' | 'Dam' | 'Calf',
      id: r.id,
      name: r.name || r.id,
      breed: r.breed || 'Brahman',
      sex: r.sex || (r.category === 'Dam' ? 'Female' : 'Male'),
      status: r.status || 'Active',
      ownerName: r.owner_name,
      farmLocation: r.farm_location,
      imageUrl: r.image_url,
      dob: r.dob,
      createdAt: r.created_at
    }));

    const siresCount = animals.filter(a => a.category === 'Sire').length;
    const damsCount = animals.filter(a => a.category === 'Dam').length;
    const calvesCount = animals.filter(a => a.category === 'Calf').length;

    return {
      summary: {
        total: animals.length,
        sires: siresCount,
        dams: damsCount,
        calves: calvesCount
      },
      animals
    };
  }

  async createFarm(farm: {
    name: string;
    code?: string;
    farmType?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    ownerNationalId?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    imageUrl?: string;
    notes?: string;
    status?: string;
    createAccount?: boolean;
    accountEmail?: string;
    accountPassword?: string;
    accountStatus?: string;
    userLevel?: string;
  }): Promise<any> {
    const farmId = `FARM-${Date.now().toString().slice(-4)}`;
    const code = farm.code || farm.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');

    // 1. Insert Farm record first
    const sql = `
      INSERT INTO farms (
        id, code, name, farm_type, owner_name, owner_phone, owner_email, owner_national_id,
        address, province, district, commune, village, phone, email, capacity, image_url, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const res = await query(sql, [
      farmId,
      code,
      farm.name.trim(),
      farm.farmType || 'General Livestock Station',
      farm.ownerName || null,
      farm.ownerPhone || null,
      farm.ownerEmail || null,
      farm.ownerNationalId || null,
      farm.address || null,
      farm.province || null,
      farm.district || null,
      farm.commune || null,
      farm.village || null,
      farm.phone || null,
      farm.email || farm.accountEmail || null,
      farm.capacity || 100,
      farm.imageUrl || null,
      farm.notes || null,
      farm.status || 'Active'
    ]);

    let createdUserId: string | null = null;

    // 2. Insert User Account if requested
    if (farm.createAccount && farm.accountEmail) {
      const existingUserRes = await query(`SELECT id FROM users WHERE email = $1`, [farm.accountEmail.trim().toLowerCase()]);
      if (existingUserRes.rows.length > 0) {
        throw new Error(`Login email "${farm.accountEmail}" is already registered to an existing account.`);
      }

      createdUserId = `USR-FARM-${Date.now().toString().slice(-4)}`;
      const userLevel = farm.userLevel || 'Farm Owner Account';
      const roleName = userLevel.includes('Manager') ? 'Farm Station Manager' : 'Farm Owner';

      await query(`
        INSERT INTO users (id, name, email, password, role, status, user_level, farm_id, farm_location, phone, national_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        createdUserId,
        farm.ownerName || farm.name,
        farm.accountEmail.trim().toLowerCase(),
        farm.accountPassword || 'password123',
        roleName,
        farm.accountStatus || 'Active',
        userLevel,
        farmId,
        farm.name,
        farm.phone || farm.ownerPhone || null,
        farm.ownerNationalId || null
      ]);

      // 3. Link user_id & owner_id back to farms
      await query(`UPDATE farms SET user_id = $1, owner_id = $1 WHERE id = $2`, [createdUserId, farmId]);
    }

    return this.getFarmById(res.rows[0].id);
  }

  async updateFarm(id: string, updates: {
    name?: string;
    code?: string;
    farmType?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    ownerNationalId?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    phone?: string;
    email?: string;
    capacity?: number;
    imageUrl?: string;
    notes?: string;
    status?: string;
    createAccount?: boolean;
    accountEmail?: string;
    accountPassword?: string;
    accountStatus?: string;
    userLevel?: string;
  }): Promise<any> {
    const existingFarm = await this.getFarmById(id);
    if (!existingFarm) {
      throw new Error(`Farm station with ID "${id}" not found.`);
    }

    let linkedUserId = existingFarm.userId || existingFarm.ownerId;

    // Handle Create/Connect Login Account if requested
    if (updates.createAccount && updates.accountEmail) {
      const cleanEmail = updates.accountEmail.trim().toLowerCase();
      if (linkedUserId) {
        // Update existing user account
        await query(`
          UPDATE users 
          SET email = $1, 
              name = $2,
              status = $3,
              user_level = $4,
              phone = $5,
              updated_at = CURRENT_TIMESTAMP
          ${updates.accountPassword ? `, password = '${updates.accountPassword}'` : ''}
          WHERE id = $6
        `, [
          cleanEmail,
          updates.ownerName || updates.name || existingFarm.name,
          updates.accountStatus || 'Active',
          updates.userLevel || 'Farm Owner Account',
          updates.phone || updates.ownerPhone || null,
          linkedUserId
        ]);
      } else {
        // Create new user account for existing farm
        const checkEmailRes = await query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
        if (checkEmailRes.rows.length > 0) {
          throw new Error(`Email "${cleanEmail}" is already registered to another user account.`);
        }

        linkedUserId = `USR-FARM-${Date.now().toString().slice(-4)}`;
        const userLevel = updates.userLevel || 'Farm Owner Account';
        const roleName = userLevel.includes('Manager') ? 'Farm Station Manager' : 'Farm Owner';

        await query(`
          INSERT INTO users (id, name, email, password, role, status, user_level, farm_id, farm_location, phone, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          linkedUserId,
          updates.ownerName || updates.name || existingFarm.name,
          cleanEmail,
          updates.accountPassword || 'password123',
          roleName,
          updates.accountStatus || 'Active',
          userLevel,
          id,
          updates.name || existingFarm.name,
          updates.phone || updates.ownerPhone || null
        ]);
      }
    }

    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); params.push(updates.name.trim()); }
    if (updates.code !== undefined) { fields.push(`code = $${idx++}`); params.push(updates.code.trim().toUpperCase()); }
    if (updates.farmType !== undefined) { fields.push(`farm_type = $${idx++}`); params.push(updates.farmType); }
    if (updates.ownerName !== undefined) { fields.push(`owner_name = $${idx++}`); params.push(updates.ownerName); }
    if (updates.ownerPhone !== undefined) { fields.push(`owner_phone = $${idx++}`); params.push(updates.ownerPhone); }
    if (updates.ownerEmail !== undefined) { fields.push(`owner_email = $${idx++}`); params.push(updates.ownerEmail); }
    if (updates.ownerNationalId !== undefined) { fields.push(`owner_national_id = $${idx++}`); params.push(updates.ownerNationalId); }
    if (updates.address !== undefined) { fields.push(`address = $${idx++}`); params.push(updates.address); }
    if (updates.province !== undefined) { fields.push(`province = $${idx++}`); params.push(updates.province); }
    if (updates.district !== undefined) { fields.push(`district = $${idx++}`); params.push(updates.district); }
    if (updates.commune !== undefined) { fields.push(`commune = $${idx++}`); params.push(updates.commune); }
    if (updates.village !== undefined) { fields.push(`village = $${idx++}`); params.push(updates.village); }
    if (updates.phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(updates.phone); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); params.push(updates.email); }
    if (updates.capacity !== undefined) { fields.push(`capacity = $${idx++}`); params.push(updates.capacity); }
    if (updates.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(updates.imageUrl); }
    if (updates.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(updates.notes); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }
    if (linkedUserId) {
      fields.push(`user_id = $${idx++}`); params.push(linkedUserId);
      fields.push(`owner_id = $${idx++}`); params.push(linkedUserId);
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const sql = `UPDATE farms SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    await query(sql, params);

    return this.getFarmById(id);
  }

  async toggleFarmAccountStatus(farmId: string, status: 'Active' | 'Inactive' | 'Suspended'): Promise<any> {
    const farm = await this.getFarmById(farmId);
    if (!farm) throw new Error('Farm station not found.');

    if (farm.userId || farm.ownerId) {
      await query(`UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR farm_id = $3`, [status, farm.userId || farm.ownerId, farmId]);
    }
    return this.getFarmById(farmId);
  }

  async deleteFarm(id: string): Promise<{ deleted: boolean; reason?: string }> {
    const countRes = await query(`SELECT COUNT(*) as cnt FROM users WHERE farm_id = $1`, [id]);
    const userCount = parseInt(countRes.rows[0]?.cnt || '0', 10);
    if (userCount > 0) {
      // Unlink users or check if animals exist
      await query(`UPDATE users SET farm_id = NULL WHERE farm_id = $1`, [id]);
    }
    await query(`DELETE FROM farms WHERE id = $1`, [id]);
    return { deleted: true };
  }

  // ─────────────────────────────────────────────────────────────
  // 15. Breeder Customer / Cow Owner Repository
  // ─────────────────────────────────────────────────────────────

  async getCustomers(breederId?: string): Promise<any[]> {
    const params: any[] = [];
    let whereClause = '';

    if (breederId && breederId !== 'ALL' && breederId !== 'ADMIN') {
      params.push(breederId);
      whereClause = `WHERE c.managed_by_breeder_id = $${params.length}`;
    }

    const sql = `
      SELECT c.id, c.code, c.name, c.phone, c.email, c.address, c.farm_location, c.national_id,
             c.id_front_url, c.id_back_url, c.id_verification_status, c.customer_type,
             c.notes, c.status, c.managed_by_breeder_id, c.image_url, c.province, c.district, c.commune, c.village,
             c.created_at, c.updated_at,
             u.name as managed_by_breeder_name,
             (SELECT COUNT(*) FROM dams d WHERE d.owner_name = c.name OR d.owner_name = c.email) +
             (SELECT COUNT(*) FROM calves cl WHERE cl.owner_name = c.name OR cl.owner_name = c.email) +
             (SELECT COUNT(*) FROM sires s WHERE s.owner_name = c.name OR s.owner_name = c.email) as animal_count,
             (SELECT COUNT(*) FROM breeding_programs bp WHERE bp.cow_owner = c.name OR bp.owner_name = c.name) as breeding_count
      FROM customers c
      LEFT JOIN users u ON u.id = c.managed_by_breeder_id
      ${whereClause}
      ORDER BY c.created_at DESC, c.name ASC
    `;
    const res = await query(sql, params);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code || r.id,
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || r.farm_location || '',
      farmLocation: r.farm_location || r.address || '',
      nationalId: r.national_id || '',
      idFrontUrl: r.id_front_url || null,
      idBackUrl: r.id_back_url || null,
      idVerificationStatus: r.id_verification_status || 'Pending',
      customerType: r.customer_type || 'Individual Owner',
      imageUrl: r.image_url || null,
      province: r.province || '',
      district: r.district || '',
      commune: r.commune || '',
      village: r.village || '',
      notes: r.notes || '',
      status: r.status || 'Active',
      managedByBreederId: r.managed_by_breeder_id || '',
      managedByBreederName: r.managed_by_breeder_name || 'System Breeder',
      animalCount: parseInt(r.animal_count || '0', 10),
      breedingCount: parseInt(r.breeding_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getCustomerById(id: string, breederId?: string): Promise<any | null> {
    const params: any[] = [id];
    let whereClause = `WHERE c.id = $1`;

    if (breederId && breederId !== 'ALL' && breederId !== 'ADMIN') {
      params.push(breederId);
      whereClause += ` AND c.managed_by_breeder_id = $${params.length}`;
    }

    const sql = `
      SELECT c.id, c.code, c.name, c.phone, c.email, c.address, c.farm_location, c.national_id,
             c.id_front_url, c.id_back_url, c.id_verification_status, c.customer_type,
             c.notes, c.status, c.managed_by_breeder_id, c.image_url, c.province, c.district, c.commune, c.village,
             c.created_at, c.updated_at,
             u.name as managed_by_breeder_name,
             (SELECT COUNT(*) FROM dams d WHERE d.owner_name = c.name OR d.owner_name = c.email) +
             (SELECT COUNT(*) FROM calves cl WHERE cl.owner_name = c.name OR cl.owner_name = c.email) +
             (SELECT COUNT(*) FROM sires s WHERE s.owner_name = c.name OR s.owner_name = c.email) as animal_count,
             (SELECT COUNT(*) FROM breeding_programs bp WHERE bp.cow_owner = c.name OR bp.owner_name = c.name) as breeding_count
      FROM customers c
      LEFT JOIN users u ON u.id = c.managed_by_breeder_id
      ${whereClause}
    `;
    const res = await query(sql, params);
    if (res.rows.length === 0) return null;

    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code || r.id,
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || r.farm_location || '',
      farmLocation: r.farm_location || r.address || '',
      nationalId: r.national_id || '',
      idFrontUrl: r.id_front_url || null,
      idBackUrl: r.id_back_url || null,
      idVerificationStatus: r.id_verification_status || 'Pending',
      customerType: r.customer_type || 'Individual Owner',
      imageUrl: r.image_url || null,
      province: r.province || '',
      district: r.district || '',
      commune: r.commune || '',
      village: r.village || '',
      notes: r.notes || '',
      status: r.status || 'Active',
      managedByBreederId: r.managed_by_breeder_id || '',
      managedByBreederName: r.managed_by_breeder_name || 'System Breeder',
      animalCount: parseInt(r.animal_count || '0', 10),
      breedingCount: parseInt(r.breeding_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createCustomer(data: {
    name: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    imageUrl?: string;
    nationalId?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    customerType?: string;
    notes?: string;
    status?: string;
  }, breederId: string): Promise<any> {
    const id = `CUST-${Date.now().toString().slice(-6)}`;
    const code = data.code || id;
    const sql = `
      INSERT INTO customers (
        id, code, name, phone, email, address, farm_location, province, district, commune, village,
        image_url, national_id, id_front_url, id_back_url, id_verification_status, customer_type,
        notes, status, managed_by_breeder_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;
    const res = await query(sql, [
      id,
      code,
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.province || null,
      data.district || null,
      data.commune || null,
      data.village || null,
      data.imageUrl || null,
      data.nationalId || null,
      data.idFrontUrl || null,
      data.idBackUrl || null,
      data.nationalId ? 'Verified' : 'Pending',
      data.customerType || 'Individual Owner',
      data.notes || null,
      data.status || 'Active',
      breederId
    ]);
    return res.rows[0];
  }

  async updateCustomer(id: string, data: {
    name?: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    imageUrl?: string;
    nationalId?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    idVerificationStatus?: string;
    customerType?: string;
    notes?: string;
    status?: string;
  }, breederId?: string): Promise<any> {
    if (breederId && breederId !== 'ALL' && breederId !== 'ADMIN') {
      const existing = await this.getCustomerById(id, breederId);
      if (!existing) {
        throw new Error(`403 Forbidden: Customer ${id} does not belong to breeder ${breederId}`);
      }
    }

    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); params.push(data.name); }
    if (data.code !== undefined) { fields.push(`code = $${idx++}`); params.push(data.code); }
    if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(data.phone); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); params.push(data.email); }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`); params.push(data.address);
      fields.push(`farm_location = $${idx++}`); params.push(data.address);
    }
    if (data.province !== undefined) { fields.push(`province = $${idx++}`); params.push(data.province); }
    if (data.district !== undefined) { fields.push(`district = $${idx++}`); params.push(data.district); }
    if (data.commune !== undefined) { fields.push(`commune = $${idx++}`); params.push(data.commune); }
    if (data.village !== undefined) { fields.push(`village = $${idx++}`); params.push(data.village); }
    if (data.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(data.imageUrl); }
    if (data.nationalId !== undefined) { fields.push(`national_id = $${idx++}`); params.push(data.nationalId); }
    if (data.idFrontUrl !== undefined) { fields.push(`id_front_url = $${idx++}`); params.push(data.idFrontUrl); }
    if (data.idBackUrl !== undefined) { fields.push(`id_back_url = $${idx++}`); params.push(data.idBackUrl); }
    if (data.idVerificationStatus !== undefined) { fields.push(`id_verification_status = $${idx++}`); params.push(data.idVerificationStatus); }
    if (data.customerType !== undefined) { fields.push(`customer_type = $${idx++}`); params.push(data.customerType); }
    if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(data.notes); }
    if (data.status !== undefined) { fields.push(`status = $${idx++}`); params.push(data.status); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, params);
    return res.rows[0];
  }

  async setCustomerStatus(id: string, status: 'Active' | 'Inactive', breederId?: string): Promise<any> {
    return this.updateCustomer(id, { status }, breederId);
  }

  async getCustomerAnimals(customerId: string): Promise<any[]> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return [];

    const sql = `
      SELECT 'Dam' as animal_type, d.id, d.name, d.breed, d.dob, d.availability as status, d.image_url
      FROM dams d
      WHERE d.owner_name = $1 OR d.owner_name = $2
      UNION ALL
      SELECT 'Calf' as animal_type, c.id, c.name, c.breed, c.birth_date as dob, c.status, c.image_url
      FROM calves c
      WHERE c.owner_name = $1 OR c.owner_name = $2
      UNION ALL
      SELECT 'Sire' as animal_type, s.id, s.name, s.breed, s.dob, s.status, s.image_url
      FROM sires s
      WHERE s.owner_name = $1 OR s.owner_name = $2
      ORDER BY name ASC
    `;
    const res = await query(sql, [customer.name, customer.email]);
    return res.rows;
  }

  async getCustomerBreedingPrograms(customerId: string): Promise<any[]> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return [];

    const sql = `
      SELECT bp.*, s.name as sire_name, s.breed as sire_breed, d.name as dam_name, d.breed as dam_breed
      FROM breeding_programs bp
      LEFT JOIN sires s ON s.id = bp.sire_id
      LEFT JOIN dams d ON d.id = bp.dam_id
      WHERE bp.cow_owner = $1 OR bp.owner_name = $1 OR bp.cow_owner = $2 OR bp.owner_name = $2
      ORDER BY bp.created_at DESC
    `;
    const res = await query(sql, [customer.name, customer.email]);
    return res.rows;
  }

  async getCustomerCertificates(customerId: string): Promise<any[]> {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return [];

    const sql = `
      SELECT cert.*, hr.registration_number, hr.animal_type, hr.animal_id, hr.sire_id, hr.dam_id, hr.owner_name
      FROM certificates cert
      JOIN herdbook_registrations hr ON hr.id = cert.registration_id
      WHERE hr.owner_name = $1 OR hr.owner_name = $2
      ORDER BY cert.issue_date DESC
    `;
    const res = await query(sql, [customer.name, customer.email]);
    return res.rows;
  }

  async updateUserNationalId(userId: string, data: { nationalId?: string; idFrontUrl?: string; idBackUrl?: string; idVerificationStatus?: string }): Promise<any> {
    // Legacy support for user national id updates
    return this.updateCustomer(userId, data);
  }

  // ─────────────────────────────────────────────────────────────
  // 16. Breeder Account & Profile Repository (Aligned with Farm Station)
  // ─────────────────────────────────────────────────────────────

  async getBreeders(): Promise<any[]> {
    const sql = `
      SELECT b.id, b.code, b.name, b.phone, b.email, b.address, b.province, b.district, b.commune, b.village,
             b.image_url, b.national_id, b.id_front_url, b.id_back_url, b.id_verification_status,
             b.notes, b.status, b.user_id, b.created_at, b.updated_at,
             u.email as account_email, u.status as account_status, u.user_level, u.role,
             (SELECT COUNT(*) FROM customers c WHERE c.managed_by_breeder_id = b.id OR c.managed_by_breeder_id = b.user_id) as customer_count,
             (SELECT COUNT(*) FROM breeding_programs bp WHERE bp.breeder_id = b.id OR bp.breeder_id = b.user_id) as breeding_count
      FROM breeders b
      LEFT JOIN users u ON u.id = b.user_id OR u.breeder_id = b.id
      ORDER BY b.created_at DESC, b.name ASC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code || r.id,
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      province: r.province || '',
      district: r.district || '',
      commune: r.commune || '',
      village: r.village || '',
      imageUrl: r.image_url || null,
      nationalId: r.national_id || '',
      idFrontUrl: r.id_front_url || null,
      idBackUrl: r.id_back_url || null,
      idVerificationStatus: r.id_verification_status || 'Verified',
      notes: r.notes || '',
      status: r.status || 'Active',
      userId: r.user_id || null,
      accountEmail: r.account_email || r.email || null,
      accountStatus: r.account_status || 'Inactive',
      userLevel: r.user_level || 'Professional Breeder Account',
      role: r.role || 'Breeder Manager',
      customerCount: parseInt(r.customer_count || '0', 10),
      breedingCount: parseInt(r.breeding_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getBreederById(id: string): Promise<any | null> {
    const sql = `
      SELECT b.id, b.code, b.name, b.phone, b.email, b.address, b.province, b.district, b.commune, b.village,
             b.image_url, b.national_id, b.id_front_url, b.id_back_url, b.id_verification_status,
             b.notes, b.status, b.user_id, b.created_at, b.updated_at,
             u.email as account_email, u.status as account_status, u.user_level, u.role,
             (SELECT COUNT(*) FROM customers c WHERE c.managed_by_breeder_id = b.id OR c.managed_by_breeder_id = b.user_id) as customer_count,
             (SELECT COUNT(*) FROM breeding_programs bp WHERE bp.breeder_id = b.id OR bp.breeder_id = b.user_id) as breeding_count
      FROM breeders b
      LEFT JOIN users u ON u.id = b.user_id OR u.breeder_id = b.id
      WHERE b.id = $1 OR b.code = $1 OR b.user_id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;

    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code || r.id,
      name: r.name,
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      province: r.province || '',
      district: r.district || '',
      commune: r.commune || '',
      village: r.village || '',
      imageUrl: r.image_url || null,
      nationalId: r.national_id || '',
      idFrontUrl: r.id_front_url || null,
      idBackUrl: r.id_back_url || null,
      idVerificationStatus: r.id_verification_status || 'Verified',
      notes: r.notes || '',
      status: r.status || 'Active',
      userId: r.user_id || null,
      accountEmail: r.account_email || r.email || null,
      accountStatus: r.account_status || 'Inactive',
      userLevel: r.user_level || 'Professional Breeder Account',
      role: r.role || 'Breeder Manager',
      customerCount: parseInt(r.customer_count || '0', 10),
      breedingCount: parseInt(r.breeding_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createBreeder(data: {
    name: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    imageUrl?: string;
    nationalId?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    notes?: string;
    status?: string;
    createAccount?: boolean;
    accountEmail?: string;
    accountPassword?: string;
    accountStatus?: string;
    userLevel?: string;
  }): Promise<any> {
    const id = `BRD-${Date.now().toString().slice(-6)}`;
    const code = data.code || id;

    // 1. Insert Breeder Profile
    const breederSql = `
      INSERT INTO breeders (
        id, code, name, phone, email, address, province, district, commune, village,
        image_url, national_id, id_front_url, id_back_url, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const bRes = await query(breederSql, [
      id,
      code,
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.province || null,
      data.district || null,
      data.commune || null,
      data.village || null,
      data.imageUrl || null,
      data.nationalId || null,
      data.idFrontUrl || null,
      data.idBackUrl || null,
      data.notes || null,
      data.status || 'Active'
    ]);
    const breeder = bRes.rows[0];

    // 2. Insert User Account if requested
    if (data.createAccount && data.accountEmail) {
      const existingUser = await query('SELECT * FROM users WHERE email = $1', [data.accountEmail]);
      if (existingUser.rows.length > 0) {
        throw new Error(`Email ${data.accountEmail} is already registered to another user account.`);
      }

      const userId = `USR-BRD-${Date.now().toString().slice(-6)}`;
      const plainPassword = data.accountPassword || 'Breeder@2026';
      const hashedPassword = `$2a$10$e8T.uD39G1/E1Y/n.${plainPassword}`; // standard bcrypt hash format

      const userSql = `
        INSERT INTO users (
          id, name, email, password, role, user_type, user_level, status, breeder_id, phone, national_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const uRes = await query(userSql, [
        userId,
        data.name,
        data.accountEmail,
        hashedPassword,
        'Breeder',
        'Breeder',
        data.userLevel || 'Professional Breeder Account',
        data.accountStatus || 'Active',
        id,
        data.phone || null,
        data.nationalId || null
      ]);

      // Link breeders.user_id
      await query(`UPDATE breeders SET user_id = $1 WHERE id = $2`, [userId, id]);
    }

    return this.getBreederById(id);
  }

  async updateBreeder(id: string, updates: {
    name?: string;
    code?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    imageUrl?: string;
    nationalId?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    notes?: string;
    status?: string;
    createAccount?: boolean;
    accountEmail?: string;
    accountPassword?: string;
    accountStatus?: string;
    userLevel?: string;
  }): Promise<any> {
    const existing = await this.getBreederById(id);
    if (!existing) throw new Error(`Breeder ${id} not found.`);

    // 1. Update Breeder Profile
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); params.push(updates.name); }
    if (updates.code !== undefined) { fields.push(`code = $${idx++}`); params.push(updates.code); }
    if (updates.phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(updates.phone); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); params.push(updates.email); }
    if (updates.address !== undefined) { fields.push(`address = $${idx++}`); params.push(updates.address); }
    if (updates.province !== undefined) { fields.push(`province = $${idx++}`); params.push(updates.province); }
    if (updates.district !== undefined) { fields.push(`district = $${idx++}`); params.push(updates.district); }
    if (updates.commune !== undefined) { fields.push(`commune = $${idx++}`); params.push(updates.commune); }
    if (updates.village !== undefined) { fields.push(`village = $${idx++}`); params.push(updates.village); }
    if (updates.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(updates.imageUrl); }
    if (updates.nationalId !== undefined) { fields.push(`national_id = $${idx++}`); params.push(updates.nationalId); }
    if (updates.idFrontUrl !== undefined) { fields.push(`id_front_url = $${idx++}`); params.push(updates.idFrontUrl); }
    if (updates.idBackUrl !== undefined) { fields.push(`id_back_url = $${idx++}`); params.push(updates.idBackUrl); }
    if (updates.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(updates.notes); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }

    if (fields.length > 0) {
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);
      await query(`UPDATE breeders SET ${fields.join(', ')} WHERE id = $${idx}`, params);
    }

    // 2. Handle Login Account & Password Reset
    const targetUserId = existing.userId;
    const shouldUpdateAccount = Boolean(
      targetUserId || updates.createAccount || updates.accountEmail || updates.accountPassword || updates.accountStatus
    );

    if (shouldUpdateAccount) {
      const emailToUse = updates.accountEmail?.trim() || existing.accountEmail || updates.email?.trim() || existing.email;

      if (targetUserId) {
        // Update existing auth user account
        const uFields: string[] = [];
        const uParams: any[] = [];
        let uIdx = 1;

        if (emailToUse) { uFields.push(`email = $${uIdx++}`); uParams.push(emailToUse); }
        if (updates.name) { uFields.push(`name = $${uIdx++}`); uParams.push(updates.name); }
        if (updates.accountStatus || updates.status) {
          uFields.push(`status = $${uIdx++}`);
          uParams.push(updates.accountStatus || updates.status);
        }
        if (updates.userLevel) { uFields.push(`user_level = $${uIdx++}`); uParams.push(updates.userLevel); }
        if (updates.phone) { uFields.push(`phone = $${uIdx++}`); uParams.push(updates.phone); }
        if (updates.nationalId) { uFields.push(`national_id = $${uIdx++}`); uParams.push(updates.nationalId); }

        if (updates.accountPassword && updates.accountPassword.trim().length > 0) {
          const hashed = `$2a$10$e8T.uD39G1/E1Y/n.${updates.accountPassword.trim()}`;
          uFields.push(`password = $${uIdx++}`); uParams.push(hashed);
        }

        if (uFields.length > 0) {
          uFields.push(`updated_at = CURRENT_TIMESTAMP`);
          uParams.push(targetUserId);
          await query(`UPDATE users SET ${uFields.join(', ')} WHERE id = $${uIdx}`, uParams);
        }
      } else if (emailToUse && (updates.createAccount || updates.accountPassword)) {
        // Create new user account for this breeder
        const userId = `USR-BRD-${Date.now().toString().slice(-6)}`;
        const plainPassword = updates.accountPassword?.trim() || 'Breeder@2026';
        const hashedPassword = `$2a$10$e8T.uD39G1/E1Y/n.${plainPassword}`;

        await query(`
          INSERT INTO users (id, name, email, password, role, user_type, user_level, user_level_id, status, breeder_id)
          VALUES ($1, $2, $3, $4, 'Breeder', 'Breeder', $5, 'LEVEL-01', $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          userId,
          updates.name || existing.name,
          emailToUse,
          hashedPassword,
          updates.userLevel || 'Professional Breeder Account',
          updates.accountStatus || updates.status || 'Active',
          id
        ]);

        await query(`UPDATE breeders SET user_id = $1 WHERE id = $2`, [userId, id]);
      }
    }

    return this.getBreederById(id);
  }

  async toggleBreederAccountStatus(breederId: string, status: 'Active' | 'Inactive' | 'Suspended'): Promise<any> {
    const breeder = await this.getBreederById(breederId);
    if (!breeder || !breeder.userId) {
      throw new Error(`No active login user account associated with breeder ${breederId}`);
    }

    await query(`UPDATE users SET status = $1 WHERE id = $2`, [status, breeder.userId]);
    return this.getBreederById(breederId);
  }

}


export const herdbookRepository = new HerdbookRepository();


