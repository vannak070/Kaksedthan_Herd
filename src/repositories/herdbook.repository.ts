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
    const res = await query('SELECT * FROM sires ORDER BY created_at DESC');
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
    const res = await query('SELECT * FROM dams ORDER BY created_at DESC');
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
  async getBreedingPrograms(): Promise<BreedingProgramItem[]> {
    const sql = `
      SELECT bp.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image_url
      FROM breeding_programs bp
      LEFT JOIN sires s ON bp.sire_id = s.id
      LEFT JOIN dams d ON bp.dam_id = d.id
      ORDER BY bp.created_at DESC
    `;
    const res = await query(sql);
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

  async getBreedingProgramById(id: string): Promise<BreedingProgramItem | null> {
    const sql = `
      SELECT bp.*, 
             s.name as sire_name, s.breed as sire_breed, s.image_url as sire_image_url,
             d.name as dam_name, d.breed as dam_breed, d.image_url as dam_image_url
      FROM breeding_programs bp
      LEFT JOIN sires s ON bp.sire_id = s.id
      LEFT JOIN dams d ON bp.dam_id = d.id
      WHERE bp.id = $1 OR bp.program_number = $1
    `;
    const res = await query(sql, [id]);
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
      // Auto-migrate costing columns if missing
      await client.query(`
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS semen_cost numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS service_fee numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS breeder_fee numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS other_cost numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS semen_qty integer DEFAULT 1;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS unit_price numeric(10,2) DEFAULT 0;
        ALTER TABLE breeding_programs ADD COLUMN IF NOT EXISTS price_override_reason text;
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
          sire_id, dam_id, owner_name, cow_owner, farm_location, breeder_name,
          price_usd, price_khr, breeding_date, pregnancy_check_date,
          expected_calving_date, status, notes,
          semen_cost, service_fee, breeder_fee, other_cost, discount,
          semen_qty, unit_price, price_override_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
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
             d.name as dam_name, d.breed as dam_breed
      FROM calves c
      LEFT JOIN sires s ON c.sire_id = s.id
      LEFT JOIN dams d ON c.dam_id = d.id
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
    const sql = `UPDATE certificates SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR certificate_number = $2`;
    await query(sql, [status, id]);
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
    const res = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
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
  async getUserLevels(): Promise<any[]> {
    const sql = `
      SELECT ul.*, 
             (SELECT COUNT(*) FROM users u WHERE u.user_level_id = ul.id OR u.user_level = ul.name) as user_count
      FROM user_levels ul
      ORDER BY ul.sort_order ASC, ul.created_at ASC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      purpose: r.purpose,
      status: r.status,
      sortOrder: r.sort_order,
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
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
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      purpose: r.purpose,
      status: r.status,
      sortOrder: r.sort_order,
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }


  async createUserLevel(level: {
    code: string;
    name: string;
    description?: string;
    purpose?: string;
    sortOrder?: number;
    defaultModules?: string[];
  }): Promise<any> {
    const id = `LEVEL-${Date.now().toString().slice(-6)}`;
    const sql = `
      INSERT INTO user_levels (id, code, name, description, purpose, sort_order, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
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

  async updateUserLevel(id: string, updates: { name?: string; description?: string; purpose?: string; sortOrder?: number; status?: 'Active' | 'Inactive' }, performedBy?: string): Promise<any> {
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

  async setUserLevelStatus(id: string, status: 'Active' | 'Inactive'): Promise<{ level: any; warning?: string }> {
    // Safety guard: check if users assigned
    const countRes = await query(`SELECT COUNT(*) as cnt FROM users WHERE user_level_id = $1 OR user_level = (SELECT name FROM user_levels WHERE id = $1)`, [id]);
    const userCount = parseInt(countRes.rows[0]?.cnt || '0', 10);

    if (status === 'Inactive' && userCount > 0) {
      const res = await query(`UPDATE user_levels SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [id]);
      return {
        level: res.rows[0],
        warning: `This user level is currently assigned to ${userCount} active users and cannot be permanently deleted. It has been set to Inactive instead.`
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
             (SELECT COUNT(*) FROM calves c WHERE c.farm_location = f.name OR c.farm_location = f.code) +
             (SELECT COUNT(*) FROM dams d WHERE d.farm_location = f.name OR d.farm_location = f.code) +
             (SELECT COUNT(*) FROM sires s WHERE s.farm_location = f.name OR s.farm_location = f.code) as animal_count,
             (SELECT COUNT(*) FROM users u WHERE u.farm_id = f.id OR u.farm_location = f.name) as user_count
      FROM farms f
      ORDER BY f.created_at ASC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      address: r.address,
      capacity: r.capacity,
      imageUrl: r.image_url,
      notes: r.notes,
      status: r.status,
      animalCount: parseInt(r.animal_count || '0', 10),
      userCount: parseInt(r.user_count || '0', 10),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async getFarmById(id: string): Promise<any | null> {
    const res = await query(`SELECT * FROM farms WHERE id = $1 OR code = $1`, [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      address: r.address,
      capacity: r.capacity,
      imageUrl: r.image_url,
      notes: r.notes,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  async createFarm(farm: { name: string; code?: string; ownerId?: string; ownerName?: string; address?: string; capacity?: number; imageUrl?: string; notes?: string }): Promise<any> {
    const id = `FARM-${Date.now().toString().slice(-4)}`;
    const code = farm.code || farm.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const sql = `
      INSERT INTO farms (id, code, name, owner_id, owner_name, address, capacity, image_url, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active')
      RETURNING *
    `;
    const res = await query(sql, [
      id,
      code,
      farm.name,
      farm.ownerId || null,
      farm.ownerName || null,
      farm.address || null,
      farm.capacity || 100,
      farm.imageUrl || null,
      farm.notes || null
    ]);
    return res.rows[0];
  }

  async updateFarm(id: string, updates: { name?: string; ownerId?: string; ownerName?: string; address?: string; capacity?: number; imageUrl?: string; notes?: string; status?: string }): Promise<any> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) { fields.push(`name = $${idx++}`); params.push(updates.name); }
    if (updates.ownerId !== undefined) { fields.push(`owner_id = $${idx++}`); params.push(updates.ownerId); }
    if (updates.ownerName !== undefined) { fields.push(`owner_name = $${idx++}`); params.push(updates.ownerName); }
    if (updates.address !== undefined) { fields.push(`address = $${idx++}`); params.push(updates.address); }
    if (updates.capacity !== undefined) { fields.push(`capacity = $${idx++}`); params.push(updates.capacity); }
    if (updates.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(updates.imageUrl); }
    if (updates.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(updates.notes); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); params.push(updates.status); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(id);
    const sql = `UPDATE farms SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, params);
    return res.rows[0];
  }

  async deleteFarm(id: string): Promise<{ deleted: boolean; reason?: string }> {
    const countRes = await query(`SELECT COUNT(*) as cnt FROM users WHERE farm_id = $1`, [id]);
    const userCount = parseInt(countRes.rows[0]?.cnt || '0', 10);
    if (userCount > 0) {
      return { deleted: false, reason: `Farm is currently associated with ${userCount} users and cannot be deleted.` };
    }
    await query(`DELETE FROM farms WHERE id = $1`, [id]);
    return { deleted: true };
  }

  // ─────────────────────────────────────────────────────────────
  // 15. Customer / Cow Owner Repository
  // ─────────────────────────────────────────────────────────────

  async getCustomers(): Promise<any[]> {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.user_level, u.status, u.phone, u.farm_location, u.company_name,
             u.national_id, u.id_front_url, u.id_back_url, u.id_verification_status, u.created_at,
             (SELECT COUNT(*) FROM calves c WHERE c.owner_name = u.name OR c.owner_name = u.email) +
             (SELECT COUNT(*) FROM dams d WHERE d.owner_name = u.name OR d.owner_name = u.email) as animal_count
      FROM users u
      WHERE u.role ILIKE '%Customer%' OR u.role ILIKE '%Owner%' OR u.user_level ILIKE '%CUSTOMER%' OR u.user_level_id = 'LEVEL-04'
      ORDER BY u.name ASC
    `;
    const res = await query(sql);
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      userLevel: r.user_level,
      status: r.status,
      phone: r.phone,
      farmLocation: r.farm_location,
      companyName: r.company_name,
      nationalId: r.national_id,
      idFrontUrl: r.id_front_url,
      idBackUrl: r.id_back_url,
      idVerificationStatus: r.id_verification_status || 'Pending',
      animalCount: parseInt(r.animal_count || '0', 10),
      createdAt: r.created_at
    }));
  }

  async updateUserNationalId(userId: string, data: { nationalId?: string; idFrontUrl?: string; idBackUrl?: string; idVerificationStatus?: string }): Promise<any> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.nationalId !== undefined) { fields.push(`national_id = $${idx++}`); params.push(data.nationalId); }
    if (data.idFrontUrl !== undefined) { fields.push(`id_front_url = $${idx++}`); params.push(data.idFrontUrl); }
    if (data.idBackUrl !== undefined) { fields.push(`id_back_url = $${idx++}`); params.push(data.idBackUrl); }
    if (data.idVerificationStatus !== undefined) { fields.push(`id_verification_status = $${idx++}`); params.push(data.idVerificationStatus); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    params.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query(sql, params);
    return res.rows[0];
  }
}

export const herdbookRepository = new HerdbookRepository();


