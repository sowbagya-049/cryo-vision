export type ProductType = 'Vaccine' | 'Dairy' | 'Frozen Food' | 'Tomato' | 'Banana';

export type TruckStatus = 'moving' | 'slow' | 'stopped';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Coordinate {
  x: number;
  y: number;
  label: string;
  geoPosition?: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  id: string;
  name: string;
  path: Coordinate[];
  distance: number;
  estimatedTime: number;
  riskZones: number[];
  description: string;
}

export interface ColdStorage {
  id: string;
  name: string;
  location: Coordinate;
}

export interface TruckState {
  position: Coordinate;
  currentRouteId: string;
  routeProgress: number;
  speed: TruckStatus;
  outsideTemp: number;
  predictedInsideTemp: number;
  freshness: number;
  productType: ProductType;
  minutesElapsed: number;
  stoppedMinutes: number;
  isReturnTrip?: boolean;
  coolingMode?: 'Standard' | 'Turbo';
  shelfLifeRemaining?: number; // In days
  thermalExposure?: number; // Cumulative degree-hours above optimal temp
}

export interface RiskAssessment {
  level: RiskLevel;
  freshnessRemaining: number;
  distanceRemaining: number;
  timeRemaining: number;
  reason: string;
}

export interface SystemDecision {
  timestamp: number;
  action: string;
  reason: string;
  previousRoute: string;
  newRoute?: string;
  freshness: number;
  minutesElapsed?: number;
}

export interface Analytics {
  routeComparisons: RouteComparison[];
  riskEvents: number;
  finalDeliveryScore: number;
  decisions: SystemDecision[];
}

export interface RouteComparison {
  routeName: string;
  distance: number;
  estimatedTime: number;
  freshnessLoss: number;
  riskLevel: RiskLevel;
}
