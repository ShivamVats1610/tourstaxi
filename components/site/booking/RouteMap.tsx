'use client';

import { MapPinned, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Coordinates, RouteDetails } from './types';

type RouteMapProps = {
  pickupCoordinates?: Coordinates | null;
  dropCoordinates?: Coordinates | null;
  stopCoordinates?: Coordinates[];
  route?: RouteDetails | null;
  className?: string;
};

type Point = {
  x: number;
  y: number;
};

const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 300;
const PADDING = 42;

export default function RouteMap({ pickupCoordinates, dropCoordinates, stopCoordinates = [], route, className = '' }: RouteMapProps) {
  const selectedPoints = [pickupCoordinates, ...stopCoordinates, dropCoordinates].filter(Boolean) as Coordinates[];
  const coordinates = stopCoordinates.length
    ? selectedPoints
    : route?.geometry?.coordinates?.length
    ? route.geometry.coordinates
    : selectedPoints;
  const points = projectCoordinates(coordinates);
  const markerPoints = stopCoordinates.length ? points : projectCoordinates(selectedPoints);
  const path = buildPath(points);
  const start = markerPoints[0] || points[0];
  const end = markerPoints[markerPoints.length - 1] || points[points.length - 1];
  const stops = markerPoints.slice(1, -1);
  const hasRoute = points.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative min-h-[300px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(249,115,22,0.14),transparent_30%)]" />

      {hasRoute ? (
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Route preview">
          <path d={path} fill="none" stroke="rgba(15,23,42,0.14)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={path} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 14" strokeLinecap="round" />
          {start && <Marker point={start} color="#0ea5e9" label="Pickup" />}
          {stops.map((point, index) => <Marker key={`${point.x}-${point.y}-${index}`} point={point} color="#14b8a6" label={`Stop ${index + 1}`} />)}
          {end && <Marker point={end} color="#f97316" label="Drop" />}
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-semibold text-slate-500">
          <span>
            <MapPinned className="mx-auto mb-2 h-7 w-7 text-sky-500" />
            Select pickup and drop suggestions to preview the route.
          </span>
        </div>
      )}

      {hasRoute && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-white/92 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
          <Navigation className="h-4 w-4 text-sky-500" />
          Route preview
        </div>
      )}
    </motion.div>
  );
}

function Marker({ point, color, label }: { point: Point; color: string; label: string }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`}>
      <circle r="13" fill="#ffffff" opacity="0.96" />
      <circle r="8" fill={color} />
      <text x="18" y="5" fill="#0f172a" fontSize="18" fontWeight="800">{label}</text>
    </g>
  );
}

function buildPath(points: Point[]) {
  if (!points.length) return '';
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function projectCoordinates(coordinates: Coordinates[]) {
  const valid = coordinates.filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
  if (!valid.length) return [];

  const lngs = valid.map(([lng]) => lng);
  const lats = valid.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;

  return valid.map(([lng, lat]) => ({
    x: PADDING + ((lng - minLng) / lngRange) * (VIEWBOX_WIDTH - PADDING * 2),
    y: PADDING + ((maxLat - lat) / latRange) * (VIEWBOX_HEIGHT - PADDING * 2)
  }));
}
