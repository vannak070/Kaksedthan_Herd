import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roles = await herdbookRepository.getUserLevelRoles(id);
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { roles } = body;
    if (!Array.isArray(roles)) {
      return NextResponse.json({ success: false, error: 'roles must be an array' }, { status: 400 });
    }
    await herdbookRepository.setUserLevelRoles(
      id,
      roles,
      req.headers.get('x-user-id') || 'admin'
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
