import {
  Coordinate,
  Route,
  ColdStorage,
  RiskAssessment,
  ProductType,
  TruckStatus,
  RiskLevel,
  TrafficLevel
} from './types';

import { PRODUCT_DATABASE } from './data/productData';

export const WAREHOUSE: Coordinate = { x: 50, y: 50, label: 'Warehouse' };
export const DESTINATION: Coordinate = { x: 750, y: 550, label: 'Destination' };

export const COLD_STORAGES: ColdStorage[] = [
  { id: 'cs1', name: 'Cold Storage A', location: { x: 300, y: 200, label: 'Cold Storage A' } },
  { id: 'cs2', name: 'Cold Storage B', location: { x: 500, y: 400, label: 'Cold Storage B' } },
];



// Simulation bounds
export const SIM_WIDTH = 800;
export const SIM_HEIGHT = 600;

// Real world bounds (approximate box covering East Coast US)
export const LAT_START = 40.7128; // NY
export const LAT_END = 25.7617;   // Miami
export const LNG_START = -74.0060; // NY
export const LNG_END = -80.1918;   // Miami

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
  _minutesElapsed: number // This represents simulation steps (e.g. 1 minute per step)
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
      geoPosition: pos.geoPosition || mapCoordinatesToGeo(pos.x, pos.y)
    };
  }

  const start = route.path[segmentIndex];
  const end = route.path[segmentIndex + 1];

  const x = start.x + (end.x - start.x) * segmentProgress;
  const y = start.y + (end.y - start.y) * segmentProgress;

  // Interpolate geoPosition directly if available for better accuracy
  let geoPosition = undefined;
  if (start.geoPosition && end.geoPosition) {
    geoPosition = {
      lat: start.geoPosition.lat + (end.geoPosition.lat - start.geoPosition.lat) * segmentProgress,
      lng: start.geoPosition.lng + (end.geoPosition.lng - start.geoPosition.lng) * segmentProgress,
    };
  } else {
    geoPosition = mapCoordinatesToGeo(x, y);
  }

  return {
    x,
    y,
    label: 'Truck',
    geoPosition
  };
}

// Map simulation coordinates (0,0 to 800,600) to real world (NY to Miami)
// NY: 40.7128, -74.0060 (Top Left approx)
// Miami: 25.7617, -80.1918 (Bottom Right approx)
export function mapCoordinatesToGeo(x: number, y: number): { lat: number; lng: number } {
  // Linear interpolation
  const lat = LAT_START + (y / SIM_HEIGHT) * (LAT_END - LAT_START);
  const lng = LNG_START + (x / SIM_WIDTH) * (LNG_END - LNG_START);

  return { lat, lng };
}

// Generate multiple route alternatives between two real-world coordinates using OSRM
export async function generateRouteAlternatives(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  productType: ProductType
): Promise<Route[]> {
  try {
    // Fetch alternatives from OSRM
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=true`
    );
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error('OSRM routing failed');
    }

    const routes: Route[] = data.routes.map((routeData: any, index: number) => {
      const coordinates = routeData.geometry.coordinates;
      const waypoints: Coordinate[] = coordinates.map((coord: [number, number], wIndex: number) => {
        const [lng, lat] = coord;
        const x = ((lng - LNG_START) / (LNG_END - LNG_START)) * SIM_WIDTH;
        const y = ((lat - LAT_START) / (LAT_END - LAT_START)) * SIM_HEIGHT;

        return {
          x: Math.max(0, Math.min(SIM_WIDTH, x)),
          y: Math.max(0, Math.min(SIM_HEIGHT, y)),
          label: wIndex === 0 ? 'Start' : wIndex === coordinates.length - 1 ? 'Destination' : `Waypoint ${wIndex}`,
          geoPosition: { lat, lng }
        };
      });

      // Simulate traffic level for each route
      const trafficLevels: TrafficLevel[] = ['Low', 'Medium', 'High'];
      const trafficLevel = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];

      const distance = Math.round(routeData.distance / 1000);
      const baseDuration = Math.round(routeData.duration / 60);

      // Adjust duration based on traffic
      let trafficMultiplier = 1;
      if (trafficLevel === 'Medium') trafficMultiplier = 1.3;
      if (trafficLevel === 'High') trafficMultiplier = 1.8;

      const estimatedTime = Math.round(baseDuration * trafficMultiplier);

      // Score the route based on product durability and traffic
      const score = calculateRouteScore(distance, estimatedTime, trafficLevel, productType);

      return {
        id: `route-${index}`,
        name: index === 0 ? 'Primary Route' : `Alternative ${index}`,
        path: waypoints,
        distance,
        estimatedTime,
        riskZones: trafficLevel === 'High' ? [Math.floor(waypoints.length / 2)] : [],
        description: `${index === 0 ? 'Fastest' : 'Alternative'} path with ${trafficLevel} traffic.`,
        trafficLevel,
        score
      };
    });

    // Sort routes by score (highest first)
    return routes.sort((a, b) => (b.score || 0) - (a.score || 0));
  } catch (error) {
    console.error('Error fetching OSRM alternatives:', error);
    return [];
  }
}

// Scoring algorithm for food safety and durability
export function calculateRouteScore(
  _distance: number,
  time: number,
  traffic: TrafficLevel,
  productType: ProductType
): number {
  const product = PRODUCT_DATABASE[productType];
  const durability = product.baseShelfLifeDays; // Higher means more durable

  // Weights (0-1)
  const timeWeight = durability < 7 ? 0.7 : 0.4; // Perishable items care more about time
  const trafficWeight = 0.3;

  // Normalize values (0-100, higher is better)
  const timeScore = Math.max(0, 100 - (time / 10)); // Assume 1000 mins is worst
  const trafficScore = traffic === 'Low' ? 100 : traffic === 'Medium' ? 60 : 20;

  return Math.round((timeScore * timeWeight) + (trafficScore * trafficWeight));
}

// Legacy function kept for compatibility, now calls generateRouteAlternatives
export async function generateCustomRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  routeName: string = 'Custom Route'
): Promise<Route> {
  const alternatives = await generateRouteAlternatives(startLat, startLng, endLat, endLng, 'Tomato');
  if (alternatives.length > 0) {
    const best = alternatives[0];
    return { ...best, name: routeName, id: 'custom-route' };
  }

  // Fallback (same as before)
  const numWaypoints = 5;
  const waypoints: Coordinate[] = [];
  for (let i = 0; i <= numWaypoints; i++) {
    const progress = i / numWaypoints;
    const lat = startLat + (endLat - startLat) * progress;
    const lng = startLng + (endLng - startLng) * progress;
    const x = ((lng - startLng) / (endLng - startLng)) * 800;
    const y = ((lat - startLat) / (endLat - startLat)) * 600;
    waypoints.push({
      x: Math.max(0, Math.min(800, x)),
      y: Math.max(0, Math.min(600, y)),
      label: i === 0 ? 'Start' : i === numWaypoints ? 'Destination' : `Waypoint ${i}`,
      geoPosition: { lat, lng }
    });
  }
  return {
    id: 'custom-route',
    name: routeName,
    path: waypoints,
    distance: 100,
    estimatedTime: 120,
    riskZones: [],
    description: 'Fallback linear route'
  };
}
