import { SystemDecision } from '../types';
import { Brain, TrendingUp } from 'lucide-react';

interface DecisionLogProps {
  decisions: SystemDecision[];
}

export function DecisionLog({ decisions }: DecisionLogProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800">Explainable AI - Decision Log</h2>
      </div>

      {decisions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No decisions made yet. System is monitoring conditions...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {decisions.map((decision) => (
            <div
              key={decision.timestamp}
              className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-900">{decision.action}</span>
                </div>
                <span className="text-xs text-purple-700 bg-purple-200 px-2 py-1 rounded">
                  {decision.minutesElapsed} min
                </span>
              </div>

              <div className="bg-white rounded p-3 mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">Why this decision?</p>
                <p className="text-sm text-gray-600 leading-relaxed">{decision.reason}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Previous Route:</span>
                  <p className="font-semibold text-gray-800">{decision.previousRoute}</p>
                </div>
                {decision.newRoute && (
                  <div>
                    <span className="text-gray-600">New Route:</span>
                    <p className="font-semibold text-green-700">{decision.newRoute}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Freshness:</span>
                  <p className="font-semibold text-blue-700">{Math.round(decision.freshness)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">How It Works:</p>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>System continuously predicts inside temperature based on outside conditions</li>
          <li>Freshness decreases faster when temperature exceeds safe range</li>
          <li>Risk is evaluated using freshness, time, distance, and temperature</li>
          <li>Routes are changed automatically before damage occurs</li>
        </ul>
      </div>
    </div>
  );
}
