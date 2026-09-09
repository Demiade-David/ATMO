"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWeather,
  getDailyForecast,
  getHourlyForecast,
  type WeatherResponse,
  type DailyForecastItem,
  type HourlyForecastItem,
} from "@/lib/openMeteo";
import { getWeatherInfo } from "@/lib/weatherCodes";
import { formatForecastDate } from "@/lib/formatDate";
import SearchBar from "@/app/components/SearchBar";

type Location = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

export default function WeatherApp() {
  const [location, setLocation] = useState<Location>({
    id: 1,
    name: "Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    country: "Nigeria",
  });

  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    async function loadWeather() {
      const data = await getWeather(location.latitude, location.longitude);

      setWeather(data);
    }

    loadWeather();
  }, [location]);

  if (!weather) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <p className="text-slate-500">Loading weather...</p>
      </main>
    );
  }

  const dailyForecast: DailyForecastItem[] = getDailyForecast(weather);
  const hourlyForecast: HourlyForecastItem[] = getHourlyForecast(weather);
  const currentHourIndex = hourlyForecast.findIndex(
    (hour: HourlyForecastItem) =>
      hour.time.slice(0, 13) === weather.current.time.slice(0, 13),
  );

  const next12Hours =
    currentHourIndex >= 0
      ? hourlyForecast.slice(currentHourIndex, currentHourIndex + 12)
      : hourlyForecast.slice(0, 12);
  const weatherInfo = getWeatherInfo(weather.current.weather_code);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ATMO
          </Link>

          <SearchBar
            onLocationSelect={(selectedLocation) =>
              setLocation(selectedLocation)
            }
          />
        </header>

        {/* Current Weather */}
        <section className="mt-16">
          <p className="text-sm text-slate-500">
            {location.name}, {location.country}
          </p>

          <div className="mt-6 text-6xl">{weatherInfo.icon}</div>

          <h2 className="mt-2 text-5xl font-semibold tracking-tight">
            {Math.round(weather.current.temperature_2m)}°
          </h2>

          <p className="mt-2 text-lg text-slate-600">
            {weatherInfo.description}
          </p>
        </section>

        {/* Weather Details */}
        <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Feels like</p>

            <p className="mt-2 text-xl font-semibold">
              {Math.round(weather.current.apparent_temperature)}°
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Humidity</p>

            <p className="mt-2 text-xl font-semibold">
              {weather.current.relative_humidity_2m}%
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Wind</p>

            <p className="mt-2 text-xl font-semibold">
              {weather.current.wind_speed_10m} km/h
            </p>
          </div>
        </section>

        {/* Hourly Forecast */}
        <section className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Hourly forecast
          </h3>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {next12Hours.map((hour: HourlyForecastItem, index: number) => (
              <div
                key={hour.time}
                className="min-w-20 rounded-2xl bg-slate-50 p-4 text-center"
              >
                <p
                  className={`min-w-20 rounded-2xl p-4 text-center ${
                    index === 0 ? "bg-slate-900 text-white" : "bg-slate-50"
                  }`}
                >
                  {index === 0
                    ? "Now"
                    : new Date(hour.time).toLocaleTimeString("en-US", {
                        hour: "numeric",
                      })}
                </p>

                <div className="mt-3 text-2xl">
                  {getWeatherInfo(hour.weatherCode).icon}
                </div>

                <p className="mt-2 text-lg font-semibold">
                  {Math.round(hour.temperature)}°
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Forecast */}
        <section className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            7-day forecast
          </h3>

          <div className="mt-4 divide-y divide-slate-100">
            {dailyForecast.map((day: DailyForecastItem) => (
              <div
                key={day.date}
                className="flex items-center justify-between py-4"
              >
                <span className="w-28 font-medium">
                  {formatForecastDate(day.date)}
                </span>

                <div className="flex items-center gap-2">
                  <span>{getWeatherInfo(day.weatherCode).icon}</span>

                  <span>{getWeatherInfo(day.weatherCode).description}</span>
                </div>

                <span className="text-slate-500">
                  {Math.round(day.minTemperature)}°
                </span>

                <span className="font-semibold">
                  {Math.round(day.maxTemperature)}°
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
