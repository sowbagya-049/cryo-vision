import { TruckState, RiskAssessment } from '../types';
import { Thermometer, Battery, AlertTriangle, Truck } from 'lucide-react';
import { PRODUCT_DATABASE } from '../data/productData';

interface MetricsPanelProps {
  truckState: TruckState;
  risk: RiskAssessment;
}

export function MetricsPanel({ truckState, risk }: MetricsPanelProps) {
  const productProfile = PRODUCT_DATABASE[truckState.productType];

  const getFreshnessColor = (freshness: number) => {
    if (freshness > 70) return 'bg-green-500';
    if (freshness > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskColor = (level: string) => {
    if (level === 'Low') return 'bg-green-100 text-green-800 border-green-300';
    if (level === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getSpeedColor = (speed: string) => {
    if (speed === 'moving') return 'text-green-600';
    if (speed === 'slow') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Live Metrics</h2>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-700">Temperature</span>
            </div>
            {truckState.coolingMode === 'Turbo' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full animate-pulse">
                TURBO COOLING
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Outside</p>
              <p className="text-2xl font-bold text-red-600">{truckState.outsideTemp}°C</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Predicted Inside</p>
              <p className="text-2xl font-bold text-blue-600">{truckState.predictedInsideTemp}°C</p>
            </div>
          </div>
        </div>

        {truckState.predictedInsideTemp > productProfile.optimalTempMax && (
          <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-3 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-bold text-orange-800">TEMPERATURE ALERT</p>
              <p className="text-xs text-orange-600">
                Inside temp ({truckState.predictedInsideTemp}°C) exceeds optimal range ({productProfile.optimalTempMin}-{productProfile.optimalTempMax}°C)
              </p>
            </div>
          </div>
        )}

        {truckState.isReturnTrip && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-bold text-red-800">RETURN TO BASE</p>
              <p className="text-xs text-red-600">Delivery Aborted - Spoilage Risk</p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-700">Freshness & Shelf Life</span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              Optimal: {productProfile.optimalTempMin}° to {productProfile.optimalTempMax}°C
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <div className="w-full bg-gray-300 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`${getFreshnessColor(truckState.freshness)} h-8 rounded-full transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${Math.max(0, truckState.freshness)}%` }}
                >
                  <span className="text-white font-bold text-sm">
                    {Math.round(truckState.freshness)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
            <span className="text-xs text-gray-600">Est. Days Remaining:</span>
            <span className={`font-bold text-lg ${truckState.shelfLifeRemaining && truckState.shelfLifeRemaining < 5 ? 'text-red-600' : 'text-gray-800'}`}>
              {truckState.shelfLifeRemaining?.toFixed(1) || '?'} Days
            </span>
          </div>

          <div className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-200">
            <span className="text-xs text-gray-600">Thermal Stress Index:</span>
            <span className={`font-bold text-lg ${(truckState.thermalExposure || 0) > 10 ? 'text-red-600' : (truckState.thermalExposure || 0) > 5 ? 'text-orange-600' : 'text-green-600'}`}>
              {truckState.thermalExposure?.toFixed(1) || '0.0'} °C·h
            </span>
          </div>

          <div className="mt-2 flex justify-between text-xs text-gray-600">
            <span>Spoiled</span>
            <span>{productProfile.baseShelfLifeDays} Days (Max)</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-700">Risk Assessment</span>
          </div>
          <div
            className={`${getRiskColor(risk.level)} border-2 rounded-lg p-3 font-bold text-center text-lg`}
          >
            {risk.level} Risk
          </div>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">{risk.reason}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-700">Truck Status</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Speed</p>
              <p className={`text-lg font-bold capitalize ${getSpeedColor(truckState.speed)}`}>
                {truckState.speed}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Product</p>
              <p className="text-lg font-bold text-gray-700">{truckState.productType}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Time Elapsed</p>
              <p className="text-lg font-bold text-gray-700">{truckState.minutesElapsed} min</p>
            </div>
            {truckState.speed === 'stopped' && (
              <div>
                <p className="text-xs text-gray-600">Stopped Time</p>
                <p className="text-lg font-bold text-red-600">{truckState.stoppedMinutes} min</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
