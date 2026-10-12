import { NextResponse } from 'next/server';
import { listPopularRoutes } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const routes = await listPopularRoutes({ fallbackToDefaults: false });
  return NextResponse.json({ routes });
}
