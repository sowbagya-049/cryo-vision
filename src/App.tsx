import { useState, useEffect, useRef } from 'react';
import {
  TruckState,
  SystemDecision,
  Analytics as AnalyticsType,
  TruckStatus,
  ProductType,
} from './types';
import {
  ROUTES,
  WAREHOUSE,
  DESTINATION,
  COLD_STORAGES,
  predictInsideTemperature,
  calculateFreshnessLoss,
  evaluateRisk,
  shouldReroute,
  interpolatePosition,
  generateCustomRoute,
} from './simulationEngine';
import { fetchCurrentWeather } from './services/weatherService';
import { geocodeAddress } from './services/geocodingService';
import { PRODUCT_DATABASE } from './data/productData';
import { MapView } from './components/MapView';
import { MetricsPanel } from './components/MetricsPanel';
import { DecisionLog } from './components/DecisionLog';
import { Analytics } from './components/Analytics';
import { SimulationControls } from './components/SimulationControls';
import { Snowflake } from 'lucide-react';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isLiveWeather, setIsLiveWeather] = useState(false);
  const [customStartLocation, setCustomStartLocation] = useState('');
  const [customEndLocation, setCustomEndLocation] = useState('');
  const [isCustomRoute, setIsCustomRoute] = useState(false);

  const initialTruckState: TruckState = {
    position: WAREHOUSE,
    currentRouteId: 'fast-risky',
    routeProgress: 0,
    speed: 'moving',
    outsideTemp: 28,
    predictedInsideTemp: 5,
    freshness: 100,
    productType: 'Vaccine',
    minutesElapsed: 0,
    stoppedMinutes: 0,
    coolingMode: 'Standard',
    shelfLifeRemaining: PRODUCT_DATABASE['Vaccine'].baseShelfLifeDays,
    thermalExposure: 0,
  };

  const [truckState, setTruckState] = useState<TruckState>(initialTruckState);
  const [decisions, setDecisions] = useState<SystemDecision[]>([]);
  const [riskEvents, setRiskEvents] = useState(0);
  const lastRiskLevel = useRef<string>('Low');

  const currentRoute = ROUTES.find((r) => r.id === truckState.currentRouteId) || ROUTES[0];

  const risk = evaluateRisk(
    truckState.freshness,
    currentRoute.distance * (1 - truckState.routeProgress),
    currentRoute.estimatedTime * (1 - truckState.routeProgress),
    truckState.outsideTemp
  );

  useEffect(() => {
    if (risk.level === 'High' && lastRiskLevel.current !== 'High') {
      setRiskEvents((prev) => prev + 1);
    }
    lastRiskLevel.current = risk.level;
  }, [risk.level]);

  // Live Weather Effect
  useEffect(() => {
    if (!isLiveWeather || !isRunning) return;

    const fetchWeather = async () => {
      if (truckState.position.geoPosition) {
        const weather = await fetchCurrentWeather(
          truckState.position.geoPosition.lat,
          truckState.position.geoPosition.lng
        );

        if (weather) {
          setTruckState(prev => ({
            ...prev,
            outsideTemp: weather.temperature
          }));
        }
      }
    };

    // Fetch immediately and then every 5 seconds (simulated time passes faster)
    fetchWeather();
    const interval = setInterval(fetchWeather, 5000);

    return () => clearInterval(interval);
  }, [isLiveWeather, isRunning, truckState.position.geoPosition]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTruckState((prev) => {
        const newMinutesElapsed = prev.minutesElapsed + 1;
        let newStoppedMinutes = prev.stoppedMinutes;

        if (prev.speed === 'stopped') {
          newStoppedMinutes += 1;
        } else {
          newStoppedMinutes = 0;
        }

        // Active Cooling Logic: Auto-engage Turbo if temp > 30
        const coolingMode = prev.outsideTemp > 30 ? 'Turbo' : 'Standard';

        const newPredictedInsideTemp = predictInsideTemperature(
          prev.outsideTemp,
          prev.speed,
          newStoppedMinutes,
          prev.productType,
          coolingMode
        );

        // Check if inside temp exceeds optimal range and create alert
        const productProfile = PRODUCT_DATABASE[prev.productType];
        const isTempExceeded = newPredictedInsideTemp > productProfile.optimalTempMax;

        if (isTempExceeded && coolingMode === 'Standard') {
          setDecisions((prevDecisions) => [
            ...prevDecisions,
            {
              timestamp: Date.now(),
              action: '⚠️ TEMPERATURE ALERT',
              reason: `Inside temperature (${newPredictedInsideTemp}°C) exceeded optimal range (${productProfile.optimalTempMin}-${productProfile.optimalTempMax}°C) for ${productProfile.name}. Engaging Turbo Cooling to protect product quality.`,
              previousRoute: route.name,
              freshness: prev.freshness,
              minutesElapsed: newMinutesElapsed,
            },
          ]);
        }

        const { freshnessLoss, daysLost } = calculateFreshnessLoss(
          newPredictedInsideTemp,
          prev.productType,
          newMinutesElapsed
        );

        const newFreshness = Math.max(0, prev.freshness - freshnessLoss);
        const newShelfLifeRemaining = Math.max(0, (prev.shelfLifeRemaining || PRODUCT_DATABASE[prev.productType].baseShelfLifeDays) - daysLost);

        // Calculate cumulative thermal exposure (degree-hours above optimal)
        const tempExcess = Math.max(0, newPredictedInsideTemp - productProfile.optimalTempMax);
        const thermalStress = tempExcess * (1 / 60); // Convert minutes to hours
        const newThermalExposure = (prev.thermalExposure || 0) + thermalStress;

        const progressIncrement = prev.speed === 'moving' ? 0.01 : prev.speed === 'slow' ? 0.005 : 0;
        let newProgress = Math.min(1, prev.routeProgress + progressIncrement);

        const route = ROUTES.find((r) => r.id === prev.currentRouteId) || ROUTES[0];
        const newPosition = interpolatePosition(route, newProgress);

        const newRisk = evaluateRisk(
          newFreshness,
          route.distance * (1 - newProgress),
          route.estimatedTime * (1 - newProgress),
          prev.outsideTemp
        );

        const rerouteDecision = shouldReroute(newRisk, prev.currentRouteId, newFreshness);

        if (rerouteDecision.shouldReroute && rerouteDecision.suggestedRoute) {
          // Handle Return to Base specifically
          if (rerouteDecision.suggestedRoute === 'return-to-base') {
            setDecisions((prevDecisions) => [
              ...prevDecisions,
              {
                timestamp: Date.now(),
                action: 'DELIVERY ABORTED',
                reason: rerouteDecision.reason || 'Critical spoilage detected.',
                previousRoute: route.name,
                newRoute: 'Return to Warehouse',
                freshness: newFreshness,
                minutesElapsed: newMinutesElapsed,
              },
            ]);

            // For prototype simplicity, we just stop the simulation and show the abort state
            // In a full version, we would generate a reverse path
            setIsRunning(false);
            return {
              ...prev,
              speed: 'stopped',
              coolingMode,
              isReturnTrip: true,
              shelfLifeRemaining: newShelfLifeRemaining,
              thermalExposure: newThermalExposure
            };
          }

          const newRoute = ROUTES.find((r) => r.id === rerouteDecision.suggestedRoute);
          if (newRoute) {
            setDecisions((prevDecisions) => [
              ...prevDecisions,
              {
                timestamp: Date.now(),
                action: 'Route Changed',
                reason: rerouteDecision.reason || 'System detected high risk',
                previousRoute: route.name,
                newRoute: newRoute.name,
                freshness: newFreshness,
                minutesElapsed: newMinutesElapsed,
              },
            ]);

            return {
              ...prev,
              currentRouteId: rerouteDecision.suggestedRoute,
              routeProgress: 0,
              position: newRoute.path[0],
              predictedInsideTemp: newPredictedInsideTemp,
              freshness: newFreshness,
              minutesElapsed: newMinutesElapsed,
              stoppedMinutes: newStoppedMinutes,
              coolingMode,
              shelfLifeRemaining: newShelfLifeRemaining,
              thermalExposure: newThermalExposure,
            };
          }
        }

        if (newProgress >= 1 && prev.routeProgress < 1) {
          setIsRunning(false);
          setDecisions((prevDecisions) => [
            ...prevDecisions,
            {
              timestamp: Date.now(),
              action: 'Delivery Complete',
              reason: `Successfully delivered with ${Math.round(newFreshness)}% freshness remaining. Final delivery quality score: ${Math.round(newFreshness * 0.8 + 20)}`,
              previousRoute: route.name,
              freshness: newFreshness,
              minutesElapsed: newMinutesElapsed,
            },
          ]);
        }

        return {
          ...prev,
          routeProgress: newProgress,
          position: newPosition,
          predictedInsideTemp: newPredictedInsideTemp,
          freshness: newFreshness,
          minutesElapsed: newMinutesElapsed,
          stoppedMinutes: newStoppedMinutes,
          coolingMode,
          shelfLifeRemaining: newShelfLifeRemaining,
          thermalExposure: newThermalExposure,
        };
      });
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  const handleReset = () => {
    setIsRunning(false);
    setTruckState(initialTruckState);
    setDecisions([]);
    setRiskEvents(0);
    lastRiskLevel.current = 'Low';
  };

  const handleScenarioChange = (scenario: string) => {
    setCurrentScenario(scenario);
    handleReset();

    let newState = { ...initialTruckState };

    switch (scenario) {
      case 'heatwave':
        newState = { ...newState, outsideTemp: 42, speed: 'slow' as TruckStatus };
        break;
      case 'traffic':
        newState = { ...newState, outsideTemp: 38, speed: 'stopped' as TruckStatus };
        break;
      case 'optimal':
        newState = { ...newState, outsideTemp: 18, speed: 'moving' as TruckStatus, currentRouteId: 'safe-long' };
        break;
      default:
        newState = { ...newState, outsideTemp: 28, speed: 'moving' as TruckStatus };
    }

    newState.predictedInsideTemp = predictInsideTemperature(
      newState.outsideTemp,
      newState.speed,
      newState.stoppedMinutes,
      newState.productType
    );

    setTruckState(newState);
  };

  const handleSetCustomRoute = async () => {
    if (!customStartLocation || !customEndLocation) {
      alert('Please enter both start and destination locations');
      return;
    }

    try {
      const startGeo = await geocodeAddress(customStartLocation);
      const endGeo = await geocodeAddress(customEndLocation);

      if (!startGeo || !endGeo) {
        alert('Could not find one or both locations. Please try again with more specific addresses.');
        return;
      }

      // Generate custom route
      const customRoute = generateCustomRoute(
        startGeo.lat,
        startGeo.lng,
        endGeo.lat,
        endGeo.lng,
        `${customStartLocation} → ${customEndLocation}`
      );

      // Update ROUTES array with custom route
      ROUTES[0] = customRoute;

      // Reset simulation with new route
      handleReset();
      setIsCustomRoute(true);
      setIsLiveWeather(true); // Auto-enable live weather for custom routes

      setDecisions([{
        timestamp: Date.now(),
        action: 'Custom Route Set',
        reason: `Route configured from ${startGeo.displayName} to ${endGeo.displayName}. Distance: ${customRoute.distance} km. Live weather enabled.`,
        previousRoute: 'Default',
        newRoute: customRoute.name,
        freshness: 100,
      }]);

    } catch (error) {
      console.error('Error setting custom route:', error);
      alert('Error setting custom route. Please try again.');
    }
  };

  const analytics: AnalyticsType = {
    routeComparisons: ROUTES.filter((r) => !r.id.includes('emergency')).map((route) => {
      let estimatedFreshnessLoss = 0;
      if (route.id === 'fast-risky') {
        estimatedFreshnessLoss = 15;
      } else {
        estimatedFreshnessLoss = 8;
      }

      let estimatedRisk: 'Low' | 'Medium' | 'High' = 'Low';
      if (route.riskZones.length > 0) {
        estimatedRisk = 'Medium';
      }

      return {
        routeName: route.name,
        distance: route.distance,
        estimatedTime: route.estimatedTime,
        freshnessLoss: estimatedFreshnessLoss,
        riskLevel: estimatedRisk,
      };
    }),
    riskEvents,
    finalDeliveryScore: Math.round(truckState.freshness * 0.8 + 20),
    decisions,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      <header className="bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Snowflake className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cold Chain Intelligence OS</h1>
              <p className="text-sm text-gray-600">
                Predictive Temperature Management & Dynamic Route Optimization
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MapView
              truckState={truckState}
              route={currentRoute}
              warehouse={WAREHOUSE}
              destination={DESTINATION}
              coldStorages={COLD_STORAGES}
            />
          </div>
          <div>
            <MetricsPanel truckState={truckState} risk={risk} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <DecisionLog decisions={decisions} />
          </div>
          <div>
            <SimulationControls
              isRunning={isRunning}
              onToggleSimulation={() => setIsRunning(!isRunning)}
              onReset={handleReset}
              onScenarioChange={handleScenarioChange}
              currentScenario={currentScenario}
              onSpeedChange={(speed) =>
                setTruckState((prev) => ({
                  ...prev,
                  speed,
                  stoppedMinutes: speed === 'stopped' ? prev.stoppedMinutes : 0,
                }))
              }
              onTemperatureChange={(temp) =>
                setTruckState((prev) => ({ ...prev, outsideTemp: temp }))
              }
              outsideTemp={truckState.outsideTemp}
              truckSpeed={truckState.speed}
              simulationSpeed={simulationSpeed}
              onSimulationSpeedChange={setSimulationSpeed}
              isLiveWeather={isLiveWeather}
              onToggleLiveWeather={() => setIsLiveWeather(!isLiveWeather)}
              productType={truckState.productType}
              onProductChange={(product) => {
                const newProduct = product as ProductType;
                setTruckState((prev) => ({
                  ...prev,
                  productType: newProduct,
                  shelfLifeRemaining: PRODUCT_DATABASE[newProduct].baseShelfLifeDays,
                }));
              }}
              customStartLocation={customStartLocation}
              customEndLocation={customEndLocation}
              onStartLocationChange={setCustomStartLocation}
              onEndLocationChange={setCustomEndLocation}
              onSetCustomRoute={handleSetCustomRoute}
            />
          </div>
        </div>

        <div>
          <Analytics analytics={analytics} />
        </div>
      </main>

      <footer className="bg-white border-t mt-8 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>
            Hackathon Prototype - Software-Only Simulation | No Physical Sensors | All Data In-Memory
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
