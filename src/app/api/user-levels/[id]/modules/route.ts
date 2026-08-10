import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const modules = await herdbookRepository.getUserLevelModules(id);
    return NextResponse.json({ success: true, data: modules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { modules } = body;
    if (!Array.isArray(modules)) {
      return NextResponse.json({ success: false, error: 'modules must be an array' }, { status: 400 });
    }
    await herdbookRepository.updateUserLevelModules(
      id,
      modules,
      req.headers.get('x-user-id') || 'admin'
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
