import {
  Coordinate,
  Route,
  ColdStorage,
  TruckState,
  RiskAssessment,
  SystemDecision,
  ProductType,
  TruckStatus,
  RiskLevel
} from './types';

import { PRODUCT_DATABASE } from './data/productData';

export const WAREHOUSE: Coordinate = { x: 50, y: 50, label: 'Warehouse' };
export const DESTINATION: Coordinate = { x: 750, y: 550, label: 'Destination' };

export const COLD_STORAGES: ColdStorage[] = [
  { id: 'cs1', name: 'Cold Storage A', location: { x: 300, y: 200, label: 'Cold Storage A' } },
  { id: 'cs2', name: 'Cold Storage B', location: { x: 500, y: 400, label: 'Cold Storage B' } },
];

export const ROUTES: Route[] = [
  {
    id: 'fast-risky',
    name: 'Fast Route (Risky)',
    path: [
      WAREHOUSE,
      { x: 200, y: 150, label: 'Highway' },
      { x: 400, y: 250, label: 'Hot Zone' },
      { x: 600, y: 400, label: 'City Center' },
      DESTINATION,
    ],
    distance: 85,
    estimatedTime: 90,
    riskZones: [2, 3],
    description: 'Fastest route but passes through hot urban areas with traffic',
  },
  {
    id: 'safe-long',
    name: 'Safe Route (Longer)',
    path: [
      WAREHOUSE,
      { x: 150, y: 250, label: 'Rural Road' },
      { x: 300, y: 350, label: 'Scenic Route' },
      { x: 500, y: 450, label: 'Cool Zone' },
      { x: 650, y: 520, label: 'Final Stretch' },
      DESTINATION,
    ],
    distance: 110,
    estimatedTime: 120,
    riskZones: [],
    description: 'Longer route with better climate conditions',
  },
  {
    id: 'emergency-cs1',
    name: 'Emergency → Cold Storage A',
    path: [
      WAREHOUSE,
      { x: 150, y: 100, label: 'Quick Path' },
      { x: 250, y: 150, label: 'Direct Route' },
      COLD_STORAGES[0].location,
    ],
    distance: 35,
    estimatedTime: 30,
    riskZones: [],
    description: 'Emergency reroute to nearest cold storage',
  },
  {
    id: 'emergency-cs2',
    name: 'Emergency → Cold Storage B',
    path: [
      WAREHOUSE,
      { x: 200, y: 200, label: 'Mid Path' },
      { x: 350, y: 300, label: 'Connect Road' },
      COLD_STORAGES[1].location,
    ],
    distance: 55,
    estimatedTime: 50,
    riskZones: [],
    description: 'Emergency reroute to central cold storage',
  },
];

export function predictInsideTemperature(
  outsideTemp: number,
  truckStatus: TruckStatus,
  stoppedMinutes: number,
  productType: ProductType,
  coolingMode: 'Standard' | 'Turbo' = 'Standard'
): number {
  const productProfile = PRODUCT_DATABASE[productType];
  const baseInsideTemp = productProfile.optimalTempMin + 1;

  let tempIncrease = 0;

  if (truckStatus === 'stopped') {
    tempIncrease = (stoppedMinutes * 0.5) + (outsideTemp * 0.15);
  } else if (truckStatus === 'slow') {
    tempIncrease = (outsideTemp * 0.08);
  } else {
    tempIncrease = (outsideTemp * 0.03);
  }

  // Active Cooling Logic: Turbo mode reduces temperature increase by 50%
  if (coolingMode === 'Turbo') {
    tempIncrease = tempIncrease * 0.5;
  }

  return Math.round((baseInsideTemp + tempIncrease) * 10) / 10;
}

export function calculateFreshnessLoss(
  predictedInsideTemp: number,
  productType: ProductType,
  minutesElapsed: number // This represents simulation steps (e.g. 1 minute per step)
): { freshnessLoss: number; daysLost: number } {
  const profile = PRODUCT_DATABASE[productType];

  // Check if temp is within optimal range
  if (predictedInsideTemp >= profile.optimalTempMin && predictedInsideTemp <= profile.optimalTempMax) {
    // Normal decay: 1 minute of simulation = 1 minute of real life decay
    // But since we want to show "Days", we need to scale it.
    // Let's say 1 simulation minute = 1 hour of real life for the sake of the demo speed
    const daysLost = (1 / 24);
    const percentageLoss = (daysLost / profile.baseShelfLifeDays) * 100;
    return { freshnessLoss: percentageLoss, daysLost };
  }

  // Accelerated decay due to heat
  // Calculate how far off we are from the max safe temp
  const tempExcess = Math.max(0, predictedInsideTemp - profile.optimalTempMax);

  // Stress factor: 1.0 is normal. 
  // Formula: 1 + (Excess Degrees * Sensitivity)
  // Example: Tomato (Sens 1.8) at 5 degrees excess = 1 + (5 * 1.8) = 10x faster decay
  const stressFactor = 1 + (tempExcess * profile.sensitivityFactor);

  // Apply stress to the base decay rate
  // 1 simulation minute = 1 hour real time * Stress Factor
  const daysLost = (1 / 24) * stressFactor;

  const percentageLoss = (daysLost / profile.baseShelfLifeDays) * 100;

  return { freshnessLoss: percentageLoss, daysLost };
}

export function evaluateRisk(
  freshness: number,
  distanceRemaining: number,
  timeRemaining: number,
  outsideTemp: number
): RiskAssessment {
  let riskScore = 0;
  let reasons: string[] = [];

  if (freshness < 30) {
    riskScore += 40;
    reasons.push(`Low freshness (${Math.round(freshness)}%)`);
  } else if (freshness < 60) {
    riskScore += 20;
    reasons.push(`Moderate freshness (${Math.round(freshness)}%)`);
  }

  const timeToFreshnessRatio = timeRemaining / Math.max(freshness, 1);
  if (timeToFreshnessRatio > 1.5) {
    riskScore += 30;
    reasons.push('Insufficient time to reach destination safely');
  }

  if (outsideTemp > 35) {
    riskScore += 20;
    reasons.push(`High outside temperature (${outsideTemp}°C)`);
  } else if (outsideTemp > 28) {
    riskScore += 10;
    reasons.push(`Elevated outside temperature (${outsideTemp}°C)`);
  }

  let level: RiskLevel;
  if (riskScore >= 50) {
    level = 'High';
  } else if (riskScore >= 25) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    level,
    freshnessRemaining: freshness,
    distanceRemaining,
    timeRemaining,
    reason: reasons.length > 0 ? reasons.join(', ') : 'All parameters within acceptable range',
  };
}

export function shouldReroute(
  risk: RiskAssessment,
  currentRouteId: string,
  freshness: number
): { shouldReroute: boolean; suggestedRoute?: string; reason?: string; isReturnTrip?: boolean } {
  // Smart Abort: If freshness is critical (< 20%), abort delivery and return to warehouse
  if (freshness < 20 && currentRouteId !== 'return-to-base') {
    return {
      shouldReroute: true,
      suggestedRoute: 'return-to-base',
      reason: `CRITICAL SPOILAGE (${Math.round(freshness)}%). Aborting delivery to prevent customer rejection. Returning to Warehouse.`,
      isReturnTrip: true
    };
  }

  if (risk.level === 'High' && freshness < 25) {
    const closestColdStorage = COLD_STORAGES[0];
    return {
      shouldReroute: true,
      suggestedRoute: 'emergency-cs1',
      reason: `Critical risk detected. Freshness at ${Math.round(freshness)}%. Redirecting to ${closestColdStorage.name} to prevent spoilage.`,
    };
  }

  if (risk.level === 'High' && currentRouteId === 'fast-risky') {
    return {
      shouldReroute: true,
      suggestedRoute: 'safe-long',
      reason: 'High risk on fast route. Switching to safer route with better climate conditions.',
    };
  }

  if (risk.level === 'Medium' && freshness < 50 && currentRouteId === 'fast-risky') {
    return {
      shouldReroute: true,
      suggestedRoute: 'safe-long',
      reason: 'Moderate risk detected. Switching to safer route to preserve remaining freshness.',
    };
  }

  return { shouldReroute: false };
}

export function calculateDistance(p1: Coordinate, p2: Coordinate): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function interpolatePosition(
  route: Route,
  progress: number
): Coordinate {
  const totalSegments = route.path.length - 1;
  const segmentIndex = Math.floor(progress * totalSegments);
  const segmentProgress = (progress * totalSegments) - segmentIndex;

  if (segmentIndex >= totalSegments) {
    const pos = route.path[route.path.length - 1];
    return {
      ...pos,
      geoPosition: mapCoordinatesToGeo(pos.x, pos.y)
    };
  }

  const start = route.path[segmentIndex];
  const end = route.path[segmentIndex + 1];

  const x = start.x + (end.x - start.x) * segmentProgress;
  const y = start.y + (end.y - start.y) * segmentProgress;

  return {
    x,
    y,
    label: 'Truck',
    geoPosition: mapCoordinatesToGeo(x, y)
  };
}

// Map simulation coordinates (0,0 to 800,600) to real world (NY to Miami)
// NY: 40.7128, -74.0060 (Top Left approx)
// Miami: 25.7617, -80.1918 (Bottom Right approx)
export function mapCoordinatesToGeo(x: number, y: number): { lat: number; lng: number } {
  // Simulation bounds
  const SIM_WIDTH = 800;
  const SIM_HEIGHT = 600;

  // Real world bounds (approximate box covering East Coast US)
  const LAT_START = 40.7128; // NY
  const LAT_END = 25.7617;   // Miami
  const LNG_START = -74.0060; // NY
  const LNG_END = -80.1918;   // Miami

  // Linear interpolation
  const lat = LAT_START + (y / SIM_HEIGHT) * (LAT_END - LAT_START);
  const lng = LNG_START + (x / SIM_WIDTH) * (LNG_END - LNG_START);

  return { lat, lng };
}

// Generate a route with waypoints between two real-world coordinates
export function generateCustomRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  routeName: string = 'Custom Route'
): Route {
  const numWaypoints = 5; // Number of intermediate points
  const waypoints: Coordinate[] = [];

  // Generate waypoints by linear interpolation
  for (let i = 0; i <= numWaypoints; i++) {
    const progress = i / numWaypoints;
    const lat = startLat + (endLat - startLat) * progress;
    const lng = startLng + (endLng - startLng) * progress;

    // Convert to simulation coordinates (reverse of mapCoordinatesToGeo)
    const x = ((lng - startLng) / (endLng - startLng)) * 800;
    const y = ((lat - startLat) / (endLat - startLat)) * 600;

    waypoints.push({
      x: Math.max(0, Math.min(800, x)),
      y: Math.max(0, Math.min(600, y)),
      label: i === 0 ? 'Start' : i === numWaypoints ? 'Destination' : `Waypoint ${i}`,
      geoPosition: { lat, lng }
    });
  }

  // Calculate approximate distance (haversine formula)
  const R = 6371; // Earth radius in km
  const dLat = (endLat - startLat) * Math.PI / 180;
  const dLng = (endLng - startLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    id: 'custom-route',
    name: routeName,
    path: waypoints,
    distance: Math.round(distance),
    estimatedTime: Math.round(distance / 80 * 60), // Assume 80 km/h average
    riskZones: [],
    description: `Custom route from ${waypoints[0].label} to ${waypoints[numWaypoints].label}`
  };
}
