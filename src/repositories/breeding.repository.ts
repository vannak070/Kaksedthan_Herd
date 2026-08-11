import { query } from '../config/database';
import { BreedingRecord } from '../types/breeding.types';
import { PoolClient } from 'pg';

export class BreedingRepository {
  private async executeQuery(sql: string, params?: any[], client?: PoolClient) {
    if (client) {
      return client.query(sql, params);
    }
    return query(sql, params);
  }

  private mapRowToBreedingRecord(row: any): BreedingRecord {
    return {
      id: row.id,
      programNumber: row.program_number || row.id,
      breedingType: row.breeding_type || 'AI',
      breedingMethod: row.breeding_method || 'Artificial Insemination (AI)',
      startDate: row.start_date || row.mating_date ? new Date(row.start_date || row.mating_date).toISOString() : new Date().toISOString(),
      priceUsd: Number(row.price_usd || 0),
      priceKhr: Number(row.price_khr || 0),
      status: row.status || 'Breeding',
      damId: row.dam_id,
      damBreed: row.dam_breed || undefined,
      sireId: row.sire_id || undefined,
      matingDate: row.mating_date ? new Date(row.mating_date).toISOString() : new Date().toISOString(),
      technician: row.technician || undefined,
      pregnancyStatus: row.pregnancy_status || 'Pending',
      pregnancyCheckDate: row.pregnancy_check_date ? new Date(row.pregnancy_check_date).toISOString() : undefined,
      expectedCalvingDate: row.expected_calving_date ? new Date(row.expected_calving_date).toISOString() : undefined,
      actualCalvingDate: row.actual_calving_date ? new Date(row.actual_calving_date).toISOString() : undefined,
      calfId: row.calf_id || undefined,
      notes: row.notes || '',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),

      // New Breeding Program Fields
      cowOwner: row.cow_owner || undefined,
      damSource: row.dam_source || undefined,
      breederName: row.breeder_name || row.technician || undefined,
      serviceType: row.service_type || row.breeding_type || 'AI',
      targetBreed: row.target_breed || undefined,
      bullName: row.bull_name || undefined,
      heatDetectionDate: row.heat_detection_date ? new Date(row.heat_detection_date).toISOString() : undefined,
      checkupDate: row.checkup_date ? new Date(row.checkup_date).toISOString() : undefined,
      expectedBirthdate: row.expected_birthdate ? new Date(row.expected_birthdate).toISOString() : undefined,
      breedingServiceCost: row.breeding_service_cost ? Number(row.breeding_service_cost) : 0,
      breedingInseminationCost: row.breeding_insemination_cost ? Number(row.breeding_insemination_cost) : 0,
    };
  }

  async findAll(): Promise<BreedingRecord[]> {
    const sql = `
      SELECT b.*, s.breed as dam_breed
      FROM breeding_records b
      LEFT JOIN stock s ON b.dam_id = s.id
      ORDER BY b.mating_date DESC
    `;
    const res = await query(sql);
    return res.rows.map(row => this.mapRowToBreedingRecord(row));
  }

  async findById(id: string): Promise<BreedingRecord | null> {
    const sql = `
      SELECT b.*, s.breed as dam_breed
      FROM breeding_records b
      LEFT JOIN stock s ON b.dam_id = s.id
      WHERE b.id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return this.mapRowToBreedingRecord(res.rows[0]);
  }

  async findByDamId(damId: string): Promise<BreedingRecord[]> {
    const sql = `
      SELECT b.*, s.breed as dam_breed
      FROM breeding_records b
      LEFT JOIN stock s ON b.dam_id = s.id
      WHERE b.dam_id = $1
      ORDER BY b.mating_date DESC
    `;
    const res = await query(sql, [damId]);
    return res.rows.map(row => this.mapRowToBreedingRecord(row));
  }

  async create(rec: Omit<BreedingRecord, 'id'> & { id?: string }, client?: PoolClient): Promise<BreedingRecord> {
    const id = rec.id || `BRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Auto calculate expected calving date (~283 days from mating) if pregnant or mating
    let expectedCalving: Date | null = rec.expectedCalvingDate ? new Date(rec.expectedCalvingDate) : (rec.expectedBirthdate ? new Date(rec.expectedBirthdate) : null);
    if (!expectedCalving && rec.matingDate) {
      const mDate = new Date(rec.matingDate);
      mDate.setDate(mDate.getDate() + 283);
      expectedCalving = mDate;
    }

    const sql = `
      INSERT INTO breeding_records (
        id, dam_id, sire_id, mating_date, breeding_type, technician, 
        pregnancy_status, pregnancy_check_date, expected_calving_date, 
        actual_calving_date, calf_id, notes,
        cow_owner, dam_source, breeder_name, service_type, breeding_method,
        target_breed, bull_name, heat_detection_date, checkup_date, expected_birthdate,
        breeding_service_cost, breeding_insemination_cost
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, 
        $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24
      )
      RETURNING *
    `;

    const params = [
      id,
      rec.damId,
      rec.sireId || null,
      rec.matingDate ? new Date(rec.matingDate) : new Date(),
      rec.breedingType || rec.serviceType === 'Nature' ? 'Natural' : 'AI',
      rec.technician || rec.breederName || null,
      rec.pregnancyStatus || 'Pending',
      rec.pregnancyCheckDate ? new Date(rec.pregnancyCheckDate) : (rec.checkupDate ? new Date(rec.checkupDate) : null),
      expectedCalving,
      rec.actualCalvingDate ? new Date(rec.actualCalvingDate) : null,
      rec.calfId || null,
      rec.notes || '',
      rec.cowOwner || null,
      rec.damSource || 'Existing Dam',
      rec.breederName || rec.technician || null,
      rec.serviceType || 'AI',
      rec.breedingMethod || 'Cross-Breeding',
      rec.targetBreed || null,
      rec.bullName || null,
      rec.heatDetectionDate ? new Date(rec.heatDetectionDate) : null,
      rec.checkupDate ? new Date(rec.checkupDate) : null,
      expectedCalving,
      rec.breedingServiceCost || 0,
      rec.breedingInseminationCost || 0
    ];

    const res = await this.executeQuery(sql, params, client);

    // Also update dam's breeding status in stock table
    if (rec.pregnancyStatus === 'Confirmed Pregnant') {
      await this.executeQuery(
        "UPDATE stock SET breeding_status = 'Confirmed Pregnant' WHERE id = $1",
        [rec.damId],
        client
      );
    } else if (rec.matingDate) {
      await this.executeQuery(
        "UPDATE stock SET breeding_status = 'Inseminated' WHERE id = $1",
        [rec.damId],
        client
      );
    }

    return this.mapRowToBreedingRecord(res.rows[0]);
  }

  async update(id: string, updates: Partial<BreedingRecord>, client?: PoolClient): Promise<BreedingRecord> {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.damId !== undefined) { fields.push(`dam_id = $${idx++}`); params.push(updates.damId); }
    if (updates.sireId !== undefined) { fields.push(`sire_id = $${idx++}`); params.push(updates.sireId); }
    if (updates.matingDate !== undefined) { fields.push(`mating_date = $${idx++}`); params.push(new Date(updates.matingDate)); }
    if (updates.breedingType !== undefined) { fields.push(`breeding_type = $${idx++}`); params.push(updates.breedingType); }
    if (updates.technician !== undefined) { fields.push(`technician = $${idx++}`); params.push(updates.technician); }
    if (updates.pregnancyStatus !== undefined) { fields.push(`pregnancy_status = $${idx++}`); params.push(updates.pregnancyStatus); }
    if (updates.pregnancyCheckDate !== undefined) { fields.push(`pregnancy_check_date = $${idx++}`); params.push(updates.pregnancyCheckDate ? new Date(updates.pregnancyCheckDate) : null); }
    if (updates.expectedCalvingDate !== undefined) { fields.push(`expected_calving_date = $${idx++}`); params.push(updates.expectedCalvingDate ? new Date(updates.expectedCalvingDate) : null); }
    if (updates.actualCalvingDate !== undefined) { fields.push(`actual_calving_date = $${idx++}`); params.push(updates.actualCalvingDate ? new Date(updates.actualCalvingDate) : null); }
    if (updates.calfId !== undefined) { fields.push(`calf_id = $${idx++}`); params.push(updates.calfId); }
    if (updates.notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(updates.notes); }

    // New Breeding Program Fields
    if (updates.cowOwner !== undefined) { fields.push(`cow_owner = $${idx++}`); params.push(updates.cowOwner); }
    if (updates.damSource !== undefined) { fields.push(`dam_source = $${idx++}`); params.push(updates.damSource); }
    if (updates.breederName !== undefined) { fields.push(`breeder_name = $${idx++}`); params.push(updates.breederName); }
    if (updates.serviceType !== undefined) { fields.push(`service_type = $${idx++}`); params.push(updates.serviceType); }
    if (updates.breedingMethod !== undefined) { fields.push(`breeding_method = $${idx++}`); params.push(updates.breedingMethod); }
    if (updates.targetBreed !== undefined) { fields.push(`target_breed = $${idx++}`); params.push(updates.targetBreed); }
    if (updates.bullName !== undefined) { fields.push(`bull_name = $${idx++}`); params.push(updates.bullName); }
    if (updates.heatDetectionDate !== undefined) { fields.push(`heat_detection_date = $${idx++}`); params.push(updates.heatDetectionDate ? new Date(updates.heatDetectionDate) : null); }
    if (updates.checkupDate !== undefined) { fields.push(`checkup_date = $${idx++}`); params.push(updates.checkupDate ? new Date(updates.checkupDate) : null); }
    if (updates.expectedBirthdate !== undefined) { fields.push(`expected_birthdate = $${idx++}`); params.push(updates.expectedBirthdate ? new Date(updates.expectedBirthdate) : null); }
    if (updates.breedingServiceCost !== undefined) { fields.push(`breeding_service_cost = $${idx++}`); params.push(updates.breedingServiceCost); }
    if (updates.breedingInseminationCost !== undefined) { fields.push(`breeding_insemination_cost = $${idx++}`); params.push(updates.breedingInseminationCost); }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`Breeding record ${id} not found`);
      return existing;
    }

    params.push(id);
    const sql = `UPDATE breeding_records SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.executeQuery(sql, params, client);
    if (res.rows.length === 0) throw new Error(`Breeding record ${id} not found`);

    const updatedRecord = this.mapRowToBreedingRecord(res.rows[0]);

    // Sync dam breeding status in stock table
    if (updates.pregnancyStatus === 'Confirmed Pregnant') {
      await this.executeQuery(
        "UPDATE stock SET breeding_status = 'Confirmed Pregnant' WHERE id = $1",
        [updatedRecord.damId],
        client
      );
    } else if (updates.actualCalvingDate) {
      await this.executeQuery(
        "UPDATE stock SET breeding_status = 'Lactating' WHERE id = $1",
        [updatedRecord.damId],
        client
      );
    } else if (updates.pregnancyStatus === 'Open') {
      await this.executeQuery(
        "UPDATE stock SET breeding_status = 'Open' WHERE id = $1",
        [updatedRecord.damId],
        client
      );
    }

    return updatedRecord;
  }

  async delete(id: string, client?: PoolClient): Promise<boolean> {
    const res = await this.executeQuery('DELETE FROM breeding_records WHERE id = $1 RETURNING id', [id], client);
    return res.rows.length > 0;
  }
}

export const breedingRepository = new BreedingRepository();
