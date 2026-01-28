// Geocoding service using OpenStreetMap Nominatim API
// Free, no API key required

interface GeocodingResult {
    lat: number;
    lng: number;
    displayName: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const geocodingCache = new Map<string, GeocodingResult>();

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
    // Check cache first
    if (geocodingCache.has(address)) {
        return geocodingCache.get(address)!;
    }

    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'ColdChainIntelligenceOS/1.0'
                }
            }
        );

        if (!response.ok) {
            console.error('Geocoding failed:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.length === 0) {
            console.error('No results found for address:', address);
            return null;
        }

        const result: GeocodingResult = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            displayName: data[0].display_name
        };

        // Cache the result
        geocodingCache.set(address, result);

        return result;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Reverse geocoding: coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'User-Agent': 'ColdChainIntelligenceOS/1.0'
                }
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
