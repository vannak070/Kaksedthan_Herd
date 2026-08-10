import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

// GET /api/user-levels/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const level = await herdbookRepository.getUserLevelById(id);
    if (!level) {
      return NextResponse.json({ success: false, error: 'User Level not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: level });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/user-levels/:id — Update user level
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, purpose, sortOrder, status } = body;

    const updated = await herdbookRepository.updateUserLevel(id, {
      name,
      description,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      status,
    });

    await herdbookRepository.recordUserLevelAudit({
      action: 'UPDATE_USER_LEVEL',
      resourceId: id,
      performedBy: req.headers.get('x-user-id') || 'admin',
      details: { name, description, status }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/user-levels/:id — Change status only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Status must be Active or Inactive' }, { status: 400 });
    }

    const result = await herdbookRepository.setUserLevelStatus(id, status);

    await herdbookRepository.recordUserLevelAudit({
      action: status === 'Active' ? 'ACTIVATE_USER_LEVEL' : 'DEACTIVATE_USER_LEVEL',
      resourceId: id,
      performedBy: req.headers.get('x-user-id') || 'admin',
      details: { newStatus: status, warning: result.warning }
    });

    return NextResponse.json({ success: true, data: result.level, warning: result.warning });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/user-levels/:id — Safe delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await herdbookRepository.deleteUserLevel(
      id,
      req.headers.get('x-user-id') || 'admin'
    );

    if (!result.deleted) {
      return NextResponse.json(
        { success: false, error: result.reason },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json({ success: true, message: 'User Level deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
