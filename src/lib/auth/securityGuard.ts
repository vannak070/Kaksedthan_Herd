import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

export async function verifySuperAdminRequest(req: NextRequest): Promise<{ authorized: boolean; response?: NextResponse; userId?: string }> {
  try {
    const userIdHeader = req.headers.get('x-user-id') || req.headers.get('x-user-email');
    const tokenCookie = req.cookies.get('kaksedthan_token')?.value;
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '').trim();

    const identity = userIdHeader || tokenCookie || authHeader;
    if (!identity) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Super Admin authority required.' },
          { status: 403 }
        )
      };
    }

    const res = await query(
      `SELECT id, role, user_level FROM users WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1`,
      [identity, identity]
    );

    if (res.rows.length === 0) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Security credentials not found.' },
          { status: 403 }
        )
      };
    }

    const u = res.rows[0];
    const isSuper = u.role === 'Super Admin' || u.role === 'Super Administrator' || u.user_level === 'Super Admin';

    if (!isSuper) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden: Your account does not have Super Admin authority.' },
          { status: 403 }
        )
      };
    }

    return { authorized: true, userId: u.id };
  } catch (error: any) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden: Verification error.' },
        { status: 403 }
      )
    };
  }
}
