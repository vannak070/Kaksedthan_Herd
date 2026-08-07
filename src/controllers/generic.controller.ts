import { Request, Response } from 'express';
import { GenericService } from '../services/generic.service';
import { getModuleConfig } from '../config/modules';

export class GenericController {
  private static getParams(req: Request) {
    const moduleName = String(req.params.module || '');
    const id = String(req.params.id || '');
    const tableMap: Record<string, string> = {
      animals: 'stock',
      breeding: 'breeding_records',
      health: 'health_logs',
      weight: 'weight_tracking',
      batches: 'batches',
      feed: 'feed_products',
      expenses: 'expenses',
      sales: 'sales_tracking',
    };
    const tableName = tableMap[moduleName] || moduleName;
    return { moduleName, id, tableName };
  }

  static async handleGetAll(req: Request, res: Response) {
    try {
      const { moduleName, tableName } = GenericController.getParams(req);
      const config = getModuleConfig(moduleName);

      const { page, limit, search, sort, order, is_archived, ...filters } = req.query;

      const result = await GenericService.getAll(tableName, {
        page: Number(page) || 1,
        limit: Number(limit) || 12,
        search: search as string,
        searchFields: config?.searchableFields || ['id'],
        sort: sort as string,
        order: (order as 'asc' | 'desc') || 'desc',
        is_archived: is_archived === 'true' ? true : is_archived === 'false' ? false : undefined,
        filters,
      });

      return res.status(200).json({
        success: true,
        module: moduleName,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err: any) {
      console.error(`[GenericController.getAll] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleGetById(req: Request, res: Response) {
    try {
      const { moduleName, id, tableName } = GenericController.getParams(req);

      const record = await GenericService.getById(tableName, id);
      if (!record) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const attachments = await GenericService.getAttachments(moduleName, id);
      const activityLogs = await GenericService.getActivityLogs(moduleName, id);

      return res.status(200).json({
        success: true,
        data: {
          ...record,
          attachments,
          activityLogs,
        },
      });
    } catch (err: any) {
      console.error(`[GenericController.getById] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleCreate(req: Request, res: Response) {
    try {
      const { moduleName, tableName } = GenericController.getParams(req);

      const record = await GenericService.create(tableName, req.body);
      await GenericService.logActivity(moduleName, String(record.id), 'CREATE', req.body.created_by || 'Admin', record);

      return res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      console.error(`[GenericController.create] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleUpdate(req: Request, res: Response) {
    try {
      const { moduleName, id, tableName } = GenericController.getParams(req);

      const record = await GenericService.update(tableName, id, req.body);
      await GenericService.logActivity(moduleName, id, 'UPDATE', req.body.updated_by || 'Admin', req.body);

      return res.status(200).json({ success: true, data: record });
    } catch (err: any) {
      console.error(`[GenericController.update] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleDelete(req: Request, res: Response) {
    try {
      const { moduleName, id, tableName } = GenericController.getParams(req);

      const record = await GenericService.softDelete(tableName, id);
      await GenericService.logActivity(moduleName, id, 'DELETE', 'Admin', { id });

      return res.status(200).json({ success: true, data: record });
    } catch (err: any) {
      console.error(`[GenericController.delete] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleRestore(req: Request, res: Response) {
    try {
      const { moduleName, id, tableName } = GenericController.getParams(req);

      const record = await GenericService.restore(tableName, id);
      await GenericService.logActivity(moduleName, id, 'RESTORE', 'Admin', { id });

      return res.status(200).json({ success: true, data: record });
    } catch (err: any) {
      console.error(`[GenericController.restore] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  static async handleArchive(req: Request, res: Response) {
    try {
      const { moduleName, id, tableName } = GenericController.getParams(req);

      const record = await GenericService.archive(tableName, id);
      await GenericService.logActivity(moduleName, id, 'ARCHIVE', 'Admin', { id });

      return res.status(200).json({ success: true, data: record });
    } catch (err: any) {
      console.error(`[GenericController.archive] Error:`, err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
