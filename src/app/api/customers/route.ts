import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

// GET /api/customers — List all customer / cow owner accounts
export async function GET(req: NextRequest) {
  try {
    const customers = await herdbookRepository.getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
