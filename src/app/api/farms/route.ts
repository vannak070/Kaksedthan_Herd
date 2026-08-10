import { NextRequest, NextResponse } from 'next/server';
import { herdbookRepository } from '@/repositories/herdbook.repository';

// GET /api/farms — List all farms
export async function GET(req: NextRequest) {
  try {
    const farms = await herdbookRepository.getFarms();
    return NextResponse.json({ success: true, data: farms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/farms — Create a new farm
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, ownerId, ownerName, address, capacity, imageUrl, notes } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Farm name is required' }, { status: 400 });
    }
    const created = await herdbookRepository.createFarm({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : undefined,
      ownerId,
      ownerName,
      address,
      capacity: capacity ? Number(capacity) : 100,
      imageUrl,
      notes
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
