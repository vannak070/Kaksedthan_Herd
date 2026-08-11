import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

// GET /api/customers/[id] — Fetch customer detail with breeder ownership verification
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const breederId = searchParams.get('breederId') || undefined;

    const customer = await herdbookRepository.getCustomerById(id, breederId);
    if (!customer) {
      return NextResponse.json({
        success: false,
        code: 'FORBIDDEN',
        error: `403 Forbidden: Access denied or customer ${id} does not belong to authorized breeder.`
      }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

// PUT /api/customers/[id] — Update customer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { breederId, ...data } = body;

    const updated = await herdbookRepository.updateCustomer(id, data, breederId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}

// PATCH /api/customers/[id] — Toggle status (Active / Inactive)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, breederId } = body;

    const updated = await herdbookRepository.setCustomerStatus(id, status, breederId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
}
