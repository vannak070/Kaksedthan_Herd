import { pool } from '../config/database';

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  searchFields?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
  is_archived?: boolean;
  filters?: Record<string, any>;
}

export class GenericService {
  /**
   * Generic Paginated & Filtered SQL Query Engine
   */
  static async getAll(tableName: string, params: QueryParams) {
    const client = await pool.connect();
    try {
      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params.limit) || 12));
      const offset = (page - 1) * limit;

      const whereClauses: string[] = [];
      const values: any[] = [];
      let valIdx = 1;

      // Soft delete filter (exclude deleted records unless requested)
      whereClauses.push(`(deleted_at IS NULL)`);

      // Archive filter
      if (params.is_archived !== undefined) {
        whereClauses.push(`is_archived = $${valIdx++}`);
        values.push(params.is_archived);
      } else {
        whereClauses.push(`(is_archived IS FALSE OR is_archived IS NULL)`);
      }

      // Search filter across searchable fields
      if (params.search && params.searchFields && params.searchFields.length > 0) {
        const searchConditions = params.searchFields
          .map((field) => `${field}::text ILIKE $${valIdx}`)
          .join(' OR ');
        whereClauses.push(`(${searchConditions})`);
        values.push(`%${params.search}%`);
        valIdx++;
      }

      // Additional dynamic filters
      if (params.filters) {
        for (const [key, val] of Object.entries(params.filters)) {
          if (val !== undefined && val !== null && val !== '') {
            whereClauses.push(`${key} = $${valIdx++}`);
            values.push(val);
          }
        }
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const sortColumn = params.sort || 'created_at';
      const sortOrder = (params.order || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Count Query
      const countResult = await client.query(
        `SELECT COUNT(*) FROM ${tableName} ${whereSql}`,
        values
      );
      const total = parseInt(countResult.rows[0].count, 10);

      // Data Query
      const dataQuery = `
        SELECT * FROM ${tableName}
        ${whereSql}
        ORDER BY ${sortColumn} ${sortOrder} NULLS LAST
        LIMIT $${valIdx++} OFFSET $${valIdx++}
      `;
      const dataResult = await client.query(dataQuery, [...values, limit, offset]);

      return {
        data: dataResult.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } finally {
      client.release();
    }
  }

  static async getById(tableName: string, id: string | number) {
    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT * FROM ${tableName} WHERE id = $1 AND deleted_at IS NULL`, [id]);
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(tableName: string, data: Record<string, any>) {
    const client = await pool.connect();
    try {
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      const cols = keys.join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const vals = keys.map((k) => data[k]);

      const sql = `INSERT INTO ${tableName} (${cols}) VALUES (${placeholders}) RETURNING *`;
      const res = await client.query(sql, vals);
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  static async update(tableName: string, id: string | number, data: Record<string, any>) {
    const client = await pool.connect();
    try {
      const keys = Object.keys(data).filter((k) => data[k] !== undefined && k !== 'id');
      if (keys.length === 0) return await this.getById(tableName, id);

      const setSql = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const vals = [id, ...keys.map((k) => data[k])];

      const sql = `UPDATE ${tableName} SET ${setSql}, updated_at = NOW() WHERE id = $1 RETURNING *`;
      const res = await client.query(sql, vals);
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async softDelete(tableName: string, id: string | number) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE ${tableName} SET deleted_at = NOW(), status = 'Deleted' WHERE id = $1 RETURNING *`,
        [id]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async restore(tableName: string, id: string | number) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE ${tableName} SET deleted_at = NULL, is_archived = false, status = 'Active' WHERE id = $1 RETURNING *`,
        [id]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async archive(tableName: string, id: string | number) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `UPDATE ${tableName} SET is_archived = true, archived_at = NOW(), status = 'Archived' WHERE id = $1 RETURNING *`,
        [id]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // ── Attachments ────────────────────────────────────────────────────────────
  static async getAttachments(entityType: string, entityId: string) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT * FROM attachments WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`,
        [entityType, entityId]
      );
      return res.rows;
    } finally {
      client.release();
    }
  }

  static async addAttachment(attachmentData: {
    entity_type: string;
    entity_id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    uploaded_by?: string;
  }) {
    const client = await pool.connect();
    try {
      const sql = `
        INSERT INTO attachments (entity_type, entity_id, file_name, file_path, mime_type, file_size, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const res = await client.query(sql, [
        attachmentData.entity_type,
        attachmentData.entity_id,
        attachmentData.file_name,
        attachmentData.file_path,
        attachmentData.mime_type,
        attachmentData.file_size,
        attachmentData.uploaded_by || 'System User',
      ]);
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  // ── Activity Log ───────────────────────────────────────────────────────────
  static async logActivity(entityType: string, entityId: string, action: string, actorName: string = 'System', details: any = {}) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO activity_logs (entity_type, entity_id, action, actor_name, details) VALUES ($1, $2, $3, $4, $5)`,
        [entityType, entityId, action, actorName, JSON.stringify(details)]
      );
    } finally {
      client.release();
    }
  }

  static async getActivityLogs(entityType: string, entityId: string) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT * FROM activity_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`,
        [entityType, entityId]
      );
      return res.rows;
    } finally {
      client.release();
    }
  }
}
