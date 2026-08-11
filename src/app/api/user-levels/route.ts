import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { verifySuperAdminRequest } from '@/lib/auth/securityGuard';

// GET /api/user-levels — List all user levels with user counts
export async function GET(req: NextRequest) {
  try {
    const levels = await herdbookRepository.getUserLevels();
    return NextResponse.json({ success: true, data: levels });
  } catch (error: any) {
    console.error('[API] GET /api/user-levels error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user levels' },
      { status: 500 }
    );
  }
}

// POST /api/user-levels — Create a new user level
export async function POST(req: NextRequest) {
  const guard = await verifySuperAdminRequest(req);
  if (!guard.authorized && guard.response) return guard.response;
  try {
    const body = await req.json();
    const { name, code, description, purpose, sortOrder, defaultModules } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const level = await herdbookRepository.createUserLevel({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      sortOrder: Number(sortOrder) || 10,
      defaultModules: defaultModules || ['dashboard'],
    });

    // Audit log
    await herdbookRepository.recordUserLevelAudit({
      action: 'CREATE_USER_LEVEL',
      resourceId: level.id,
      performedBy: req.headers.get('x-user-id') || 'admin',
      details: { name, code, description }
    });

    return NextResponse.json({ success: true, data: level }, { status: 201 });
  } catch (error: any) {
    console.error('[API] POST /api/user-levels error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user level' },
      { status: 500 }
    );
  }
}
