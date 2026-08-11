import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/repositories/settings.repository';

export async function GET(request: NextRequest) {
  try {
    const roles = await settingsRepository.getRolesFromDb();
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
