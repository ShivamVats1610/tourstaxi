export type Coordinates = [number, number];

export type RouteLineString = {
  type: 'LineString';
  coordinates: Coordinates[];
};

export type LocationResult = {
  id: string;
  label: string;
  name: string;
  address: string;
  coordinates: Coordinates;
};

export type RouteDetails = {
  distanceKm: number;
  durationMinutes: number;
  geometry: RouteLineString | null;
};

export type VehicleClass = 'sedan' | 'suv' | 'innova-crysta' | 'tempo-traveller';

export type FareDetails = {
  baseFare: number;
  ratePerKm: number;
  distanceFare: number;
  totalFare: number;
};
