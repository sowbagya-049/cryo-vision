import { Analytics as AnalyticsType, RouteComparison } from '../types';
import { BarChart3, Award } from 'lucide-react';

interface AnalyticsProps {
  analytics: AnalyticsType;
}

export function Analytics({ analytics }: AnalyticsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Analytics & Route Comparison</h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Final Delivery Quality Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(analytics.finalDeliveryScore)}`}>
              {Math.round(analytics.finalDeliveryScore)}
            </p>
          </div>
          <div className="text-center">
            <Award className="w-16 h-16 text-yellow-500 mb-2 mx-auto" />
            <div className={`text-4xl font-bold ${getScoreColor(analytics.finalDeliveryScore)}`}>
              {getScoreGrade(analytics.finalDeliveryScore)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Risk Events</p>
            <p className="text-3xl font-bold text-orange-600">{analytics.riskEvents}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Route Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-700">Route Name</th>
                <th className="text-center p-3 font-semibold text-gray-700">Distance (km)</th>
                <th className="text-center p-3 font-semibold text-gray-700">Est. Time (min)</th>
                <th className="text-center p-3 font-semibold text-gray-700">Freshness Loss</th>
                <th className="text-center p-3 font-semibold text-gray-700">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {analytics.routeComparisons.map((route, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800">{route.routeName}</td>
                  <td className="p-3 text-center text-gray-600">{route.distance}</td>
                  <td className="p-3 text-center text-gray-600">{route.estimatedTime}</td>
                  <td className="p-3 text-center">
                    <span className="text-orange-600 font-semibold">
                      -{route.freshnessLoss.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        route.riskLevel === 'Low'
                          ? 'bg-green-100 text-green-700'
                          : route.riskLevel === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {route.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Key Insights</h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>
            Score calculation: Based on final freshness, time efficiency, and risk mitigation
          </li>
          <li>Lower risk events indicate better predictive routing decisions</li>
          <li>Freshness loss varies by route conditions and temperature exposure</li>
        </ul>
      </div>
    </div>
  );
}
