import { NextRequest, NextResponse } from 'next/server';
import { PERMISSION_CATALOG } from '@/types/settings.types';
import { settingsRepository } from '@/repositories/settings.repository';

export async function GET(request: NextRequest) {
  try {
    let dbPerms: any[] = [];
    try {
      dbPerms = await settingsRepository.getPermissionsCatalog();
    } catch {
      dbPerms = [];
    }
    const merged = PERMISSION_CATALOG.map(cat => {
      const db = dbPerms.find(d => d.key === cat.key);
      return db ? { ...cat, ...db } : cat;
    });
    return NextResponse.json({ success: true, data: merged });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
