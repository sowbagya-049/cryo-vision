import { Route, Coordinate, ColdStorage, TruckState } from '../types';
import { Truck, Home, MapPin, Snowflake } from 'lucide-react';

interface MapViewProps {
  truckState: TruckState;
  route: Route;
  warehouse: Coordinate;
  destination: Coordinate;
  coldStorages: ColdStorage[];
}

export function MapView({ truckState, route, warehouse, destination, coldStorages }: MapViewProps) {
  const mapWidth = 800;
  const mapHeight = 600;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Live Route Map</h2>

      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
        <svg width={mapWidth} height={mapHeight} className="block">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>

          {route.path.map((point, idx) => {
            if (idx < route.path.length - 1) {
              const next = route.path[idx + 1];
              const isRiskZone = route.riskZones.includes(idx);
              return (
                <line
                  key={`line-${idx}`}
                  x1={point.x}
                  y1={point.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={isRiskZone ? '#ef4444' : '#3b82f6'}
                  strokeWidth={isRiskZone ? 4 : 3}
                  strokeDasharray={isRiskZone ? '8,4' : 'none'}
                  markerEnd="url(#arrowhead)"
                  opacity={0.7}
                />
              );
            }
            return null;
          })}

          {route.path.map((point, idx) => (
            <g key={`waypoint-${idx}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={6}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700"
              >
                {point.label}
              </text>
            </g>
          ))}

          {coldStorages.map((cs) => (
            <g key={cs.id}>
              <circle
                cx={cs.location.x}
                cy={cs.location.y}
                r={12}
                fill="#06b6d4"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={cs.location.x}
                y={cs.location.y + 25}
                textAnchor="middle"
                className="text-sm font-bold fill-cyan-700"
              >
                {cs.name}
              </text>
            </g>
          ))}

          <g>
            <rect
              x={warehouse.x - 15}
              y={warehouse.y - 15}
              width={30}
              height={30}
              fill="#10b981"
              stroke="white"
              strokeWidth={2}
              rx={4}
            />
            <text
              x={warehouse.x}
              y={warehouse.y + 35}
              textAnchor="middle"
              className="text-sm font-bold fill-green-700"
            >
              {warehouse.label}
            </text>
          </g>

          <g>
            <rect
              x={destination.x - 15}
              y={destination.y - 15}
              width={30}
              height={30}
              fill="#8b5cf6"
              stroke="white"
              strokeWidth={2}
              rx={4}
            />
            <text
              x={destination.x}
              y={destination.y + 35}
              textAnchor="middle"
              className="text-sm font-bold fill-purple-700"
            >
              {destination.label}
            </text>
          </g>

          <g>
            <circle
              cx={truckState.position.x}
              cy={truckState.position.y}
              r={18}
              fill="#f59e0b"
              stroke="white"
              strokeWidth={3}
            />
            <circle
              cx={truckState.position.x}
              cy={truckState.position.y}
              r={22}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              opacity={0.5}
            >
              <animate
                attributeName="r"
                from="22"
                to="30"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.5"
                to="0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>

        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs">Warehouse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-xs">Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
            <span className="text-xs">Cold Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-xs">Truck</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500"></div>
            <span className="text-xs">Risk Zone</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm font-semibold text-blue-900">Current Route</p>
          <p className="text-lg font-bold text-blue-700">{route.name}</p>
          <p className="text-xs text-blue-600 mt-1">{route.description}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-sm font-semibold text-orange-900">Progress</p>
          <p className="text-lg font-bold text-orange-700">
            {Math.round(truckState.routeProgress * 100)}%
          </p>
          <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${truckState.routeProgress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
