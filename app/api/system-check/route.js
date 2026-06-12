import { runMapboxHealthChecks } from '@/lib/mapbox';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const startedAt = Date.now();
  const health = await runMapboxHealthChecks();
  const origin = new URL(request.url).origin;

  return Response.json({
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    deployment: {
      origin,
      nodeEnv: process.env.NODE_ENV || 'unknown',
      runtime: 'next-route-handler',
      production: process.env.NODE_ENV === 'production'
    },
    environment: {
      NEXT_PUBLIC_MAPBOX_TOKEN: health.tokenStatus
    },
    mapbox: {
      token: health.tokenStatus,
      geocoding: health.geocoding,
      directions: health.directions,
      route: health.route
    }
  });
}
