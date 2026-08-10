import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const logs = await herdbookRepository.getUserLevelAudit(id);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
