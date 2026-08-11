import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

// GET /api/customers — List breeder's customers (or filter by breederId query param)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const breederId = searchParams.get('breederId') || undefined;

    const customers = await herdbookRepository.getCustomers(breederId);
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/customers — Create new customer under authorized breeder
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { breederId = 'BREEDER-01', ...data } = body;

    const newCustomer = await herdbookRepository.createCustomer(data, breederId);
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
