import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinate } from '../types';

interface LiveMapProps {
  currentPosition: Coordinate;
  route: Coordinate[];
  destination: Coordinate;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  isSelectingLocation?: boolean;
  selectionMode?: 'start' | 'end' | null;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom truck icon
const truckIcon = L.divIcon({
  className: 'truck-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      border: 3px solid white;
      animation: pulse 2s infinite;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M18 18.5a1.5 1.5 0 0 1-1 1.5 1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1 1.5M19.5 9.5h-2.5V6L15 9.5h4.5M6 18.5A1.5 1.5 0 0 1 4.5 20 1.5 1.5 0 0 1 3 18.5 1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 18.5M20 8h-3l3-4.5V8M17 5.5V13H3c-1.11 0-2 .89-2 2v3h2a3 3 0 0 0 3 3 3 3 0 0 0 3-3h6a3 3 0 0 0 3 3 3 3 0 0 0 3-3h2v-5c0-.5-.21-1-.5-1.4l-3.5-4.1c-.4-.4-.9-.5-1.5-.5H17Z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export function LiveMap({
  currentPosition,
  route,
  destination,
  onLocationSelect,
  isSelectingLocation = false,
  selectionMode = null
}: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map('live-map').setView([40.7128, -74.0060], 6); // Default: New York

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add click handler for location selection
      map.on('click', async (e) => {
        if (isSelectingLocation && onLocationSelect) {
          const { lat, lng } = e.latlng;

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              {
                headers: {
                  'User-Agent': 'ColdChainIntelligenceOS/1.0'
                }
              }
            );
            const data = await response.json();
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            // Add temporary marker
            if (selectionMarkerRef.current) {
              selectionMarkerRef.current.remove();
            }

            const markerColor = selectionMode === 'start' ? '#10b981' : '#ef4444';
            const markerLabel = selectionMode === 'start' ? 'Start' : 'End';

            selectionMarkerRef.current = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'selection-marker',
                html: `
                  <div style="
                    background: ${markerColor};
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    border: 3px solid white;
                    animation: bounce 0.5s;
                  ">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${markerLabel}</span>
                  </div>
                `,
                iconSize: [35, 35],
                iconAnchor: [17.5, 17.5],
              }),
            })
              .addTo(map)
              .bindPopup(`<b>${markerLabel} Location</b><br>${address}`).openPopup();

            onLocationSelect(lat, lng, address);
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        }
      });

      mapRef.current = map;

      // Add destination marker
      if (destination.geoPosition) {
        L.marker([destination.geoPosition.lat, destination.geoPosition.lng], {
          icon: L.divIcon({
            className: 'destination-marker',
            html: `
              <div style="
                background: #ef4444;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
                border: 2px solid white;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br>${destination.label}`);
      }
    }

    // Update truck position
    if (mapRef.current && currentPosition.geoPosition) {
      const { lat, lng } = currentPosition.geoPosition;

      if (!truckMarkerRef.current) {
        // Create truck marker
        truckMarkerRef.current = L.marker([lat, lng], { icon: truckIcon })
          .addTo(mapRef.current)
          .bindPopup('<b>🚚 Delivery Truck</b><br>Live tracking...');
      } else {
        // Animate truck movement
        truckMarkerRef.current.setLatLng([lat, lng]);
      }

      // Center map on truck
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }

    // Draw route line with traffic coloring
    if (mapRef.current && route.length > 0) {
      const routeCoords = route
        .filter((point) => point.geoPosition)
        .map((point) => [point.geoPosition!.lat, point.geoPosition!.lng] as [number, number]);

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(routeCoords);

        // Update color if traffic level changes
        const trafficLevel = (route as any).trafficLevel || 'Low';
        const trafficColor = trafficLevel === 'High' ? '#ef4444' : trafficLevel === 'Medium' ? '#f59e0b' : '#10b981';
        routeLineRef.current.setStyle({
          color: trafficColor,
          dashArray: trafficLevel === 'High' ? '5, 5' : 'none'
        });
      } else if (routeCoords.length > 0) {
        // Determine color based on traffic level
        const trafficLevel = (route as any).trafficLevel || 'Low';
        const trafficColor = trafficLevel === 'High' ? '#ef4444' : trafficLevel === 'Medium' ? '#f59e0b' : '#10b981';

        routeLineRef.current = L.polyline(routeCoords, {
          color: trafficColor,
          weight: 5,
          opacity: 0.8,
          dashArray: trafficLevel === 'High' ? '5, 5' : 'none',
        }).addTo(mapRef.current);
      }
    }
  }, [currentPosition, route, destination]);

  return (
    <div className="relative w-full h-full">
      {isSelectingLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="font-bold text-sm">
            {selectionMode === 'start' ? '📍 Click on map to set START location' : '🎯 Click on map to set END location'}
          </p>
        </div>
      )}

      <div id="live-map" className="w-full h-full rounded-lg shadow-lg" style={{ minHeight: '500px', cursor: isSelectingLocation ? 'crosshair' : 'grab' }} />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
        <h3 className="text-xs font-bold text-gray-700 mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <span>Truck Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }}></div>
            <span>Route</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .truck-marker, .destination-marker, .selection-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
