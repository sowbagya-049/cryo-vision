import { TruckStatus } from '../types';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onReset: () => void;
  onScenarioChange: (scenario: string) => void;
  currentScenario: string;
  onSpeedChange: (speed: TruckStatus) => void;
  onTemperatureChange: (temp: number) => void;
  outsideTemp: number;
  truckSpeed: TruckStatus;
  simulationSpeed: number;
  onSimulationSpeedChange: (speed: number) => void;
  isLiveWeather: boolean;
  onToggleLiveWeather: () => void;
  productType: string;
  onProductChange: (product: string) => void;
  customStartLocation: string;
  customEndLocation: string;
  onStartLocationChange: (location: string) => void;
  onEndLocationChange: (location: string) => void;
  onSetCustomRoute: () => void;
}

export function SimulationControls({
  isRunning,
  onToggleSimulation,
  onReset,
  onScenarioChange,
  currentScenario,
  onSpeedChange,
  onTemperatureChange,
  outsideTemp,
  truckSpeed,
  simulationSpeed,
  onSimulationSpeedChange,
  isLiveWeather,
  onToggleLiveWeather,
  productType,
  onProductChange,
  customStartLocation,
  customEndLocation,
  onStartLocationChange,
  onEndLocationChange,
  onSetCustomRoute,
}: SimulationControlsProps) {
  const scenarios = [
    { id: 'normal', name: 'Normal Conditions', desc: 'Standard delivery with moderate weather' },
    { id: 'heatwave', name: 'Heatwave', desc: 'High temperatures, high risk scenario' },
    { id: 'traffic', name: 'Traffic Jam', desc: 'Truck stops frequently in hot weather' },
    { id: 'optimal', name: 'Optimal Conditions', desc: 'Cool weather, smooth traffic' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-800">Simulation Controls</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Demo Scenario
          </label>
          <select
            value={currentScenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name} - {scenario.desc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Type
          </label>
          <select
            value={productType}
            onChange={(e) => onProductChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Vaccine">COVID-19 Vaccine</option>
            <option value="Dairy">Fresh Milk</option>
            <option value="Frozen Food">Premium Ice Cream</option>
            <option value="Tomato">Organic Tomatoes 🍅</option>
            <option value="Banana">Cavendish Bananas 🍌</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 Custom GPS Route</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Location
              </label>
              <input
                type="text"
                value={customStartLocation}
                onChange={(e) => onStartLocationChange(e.target.value)}
                placeholder="e.g., Los Angeles, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Destination Location
              </label>
              <input
                type="text"
                value={customEndLocation}
                onChange={(e) => onEndLocationChange(e.target.value)}
                placeholder="e.g., Phoenix, AZ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={onSetCustomRoute}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              🗺️ Set Custom Route
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onToggleSimulation}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${isRunning
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'Pause' : 'Start'} Simulation
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Simulation Speed: {simulationSpeed}x
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={simulationSpeed}
            onChange={(e) => onSimulationSpeedChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1x</span>
            <span>5x</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Manual Controls</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Outside Temperature: {outsideTemp}°C
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Live Weather</span>
                <button
                  onClick={onToggleLiveWeather}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLiveWeather ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isLiveWeather ? 'translate-x-5' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="45"
              value={outsideTemp}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              disabled={isLiveWeather}
              className={`w-full ${isLiveWeather ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>10°C (Cool)</span>
              <span>45°C (Extreme)</span>
            </div>
            {isLiveWeather && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Fetching real-time weather from OpenMeteo...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Truck Speed</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSpeedChange('moving')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${truckSpeed === 'moving'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Moving
              </button>
              <button
                onClick={() => onSpeedChange('slow')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${truckSpeed === 'slow'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Slow
              </button>
              <button
                onClick={() => onSpeedChange('stopped')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${truckSpeed === 'stopped'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Stopped
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
