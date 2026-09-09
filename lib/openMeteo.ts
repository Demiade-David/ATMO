const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export type WeatherResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    weather_code: number[];
    temperature_2m: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export type DailyForecastItem = {
  date: string;
  weatherCode: number;
  maxTemperature: number;
  minTemperature: number;
};

export type HourlyForecastItem = {
  time: string;
  weatherCode: number;
  temperature: number;
};

export type OpenMeteoHourlyForecast = {
  hourly: {
    time: string[];
    weather_code: number[];
    temperature_2m: number[];
  };
};

export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherResponse> {
  const url =
    `${BASE_URL}?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return (await response.json()) as WeatherResponse;
}

export function getDailyForecast(
  weather: WeatherResponse,
): DailyForecastItem[] {
  return weather.daily.time.map((date: string, index: number) => ({
    date,
    weatherCode: weather.daily.weather_code[index],
    maxTemperature: weather.daily.temperature_2m_max[index],
    minTemperature: weather.daily.temperature_2m_min[index],
  }));
}
export function getHourlyForecast(
  weather: WeatherResponse,
): HourlyForecastItem[] {
  return weather.hourly.time.map((time: string, index: number) => ({
    time,
    weatherCode: weather.hourly.weather_code[index],
    temperature: weather.hourly.temperature_2m[index],
  }));
}

export async function searchLocations(query: string) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(query)}` +
    `&count=5` +
    `&language=en` +
    `&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to search locations");
  }

  const data = await response.json();

  return data.results ?? [];
}
