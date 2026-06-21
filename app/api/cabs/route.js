import { NextResponse } from 'next/server';
import { listCabs } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cabs = await listCabs({ fallbackToFleet: false });
  return NextResponse.json({ cabs });
}
