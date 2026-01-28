
interface WeatherData {
  temperature: number;
  time: string;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache
const cache: Record<string, { data: WeatherData; timestamp: number }> = {};

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    const weatherData: WeatherData = {
      temperature: data.current.temperature_2m,
      time: data.current.time,
    };

    cache[cacheKey] = {
      data: weatherData,
      timestamp: now,
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}
