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

function formatForecastTime(time: string) {
  const [hours = "0", minutes = "00"] = time.slice(11, 16).split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minutes} ${period}`;
}

function LoadingState() {
  return (
    <main className="weather-shell">
      <div className="weather-container">
        <div className="loading-header">
          <div className="skeleton skeleton-logo" />
          <div className="skeleton skeleton-search" />
        </div>
        <div className="loading-hero">
          <div className="skeleton skeleton-line skeleton-short" />
          <div className="skeleton skeleton-line skeleton-temperature" />
          <div className="skeleton skeleton-line skeleton-medium" />
        </div>
        <div className="loading-cards">
          {[1, 2, 3].map((item) => (
            <div className="skeleton skeleton-card" key={item} />
          ))}
        </div>
      </div>
      <p className="sr-only" role="status">
        Loading weather forecast
      </p>
    </main>
  );
}

export default function WeatherApp() {
  const [location, setLocation] = useState<Location>({
    id: 1,
    name: "Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    country: "Nigeria",
  });
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  function selectLocation(selectedLocation: Location) {
    setWeather(null);
    setIsLoading(true);
    setLocation(selectedLocation);
  }

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadWeather() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getWeather(location.latitude, location.longitude);

        if (isCurrentRequest) {
          setWeather(data);
        }
      } catch {
        if (isCurrentRequest) {
          setWeather(null);
          setError("We couldn’t load the forecast. Check your connection and try again.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      isCurrentRequest = false;
    };
  }, [location, retryCount]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!weather) {
    return (
      <main className="weather-shell">
        <div className="weather-container">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="ATMO home">
              <span className="brand-mark" aria-hidden="true">A</span>
              <span>atmo</span>
            </Link>
            <SearchBar onLocationSelect={selectLocation} />
          </header>
          <section className="error-panel" role="alert">
            <span className="error-icon" aria-hidden="true">!</span>
            <h1>Weather is taking a rain check</h1>
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </section>
        </div>
      </main>
    );
  }

  const dailyForecast: DailyForecastItem[] = getDailyForecast(weather);
  const hourlyForecast: HourlyForecastItem[] = getHourlyForecast(weather);
  const currentHourIndex = hourlyForecast.findIndex(
    (hour) => hour.time.slice(0, 13) === weather.current.time.slice(0, 13),
  );
  const next12Hours =
    currentHourIndex >= 0
      ? hourlyForecast.slice(currentHourIndex, currentHourIndex + 12)
      : hourlyForecast.slice(0, 12);
  const weatherInfo = getWeatherInfo(weather.current.weather_code);
  const weekLow = Math.min(...dailyForecast.map((day) => day.minTemperature));
  const weekHigh = Math.max(...dailyForecast.map((day) => day.maxTemperature));
  const weekTemperatureRange = Math.max(weekHigh - weekLow, 1);

  return (
    <main className="weather-shell">
      <div className="weather-container">
        <header className="site-header">
          <Link href="/" className="brand" aria-label="ATMO home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span>atmo</span>
          </Link>
          <SearchBar onLocationSelect={selectLocation} />
        </header>

        <section className="current-weather" aria-labelledby="current-heading">
          <div className="current-copy">
            <p className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              Current conditions
            </p>
            <p className="location-name">
              {location.name}
              <span>{location.admin1 ? `${location.admin1}, ` : ""}{location.country}</span>
            </p>
            <h1 id="current-heading" className="current-temperature">
              {Math.round(weather.current.temperature_2m)}
              <span>°</span>
            </h1>
            <p className="current-description">{weatherInfo.description}</p>
            <p className="feels-like">
              Feels like {Math.round(weather.current.apparent_temperature)}°
            </p>
          </div>
          <div className="current-art" aria-hidden="true">
            <span className="weather-orbit orbit-one" />
            <span className="weather-orbit orbit-two" />
            <span className="hero-weather-icon">{weatherInfo.icon}</span>
          </div>
        </section>

        <section className="weather-details" aria-label="Weather details">
          <article className="detail-card">
            <span className="detail-icon humidity-icon" aria-hidden="true">%</span>
            <div>
              <p>Humidity</p>
              <strong>{weather.current.relative_humidity_2m}%</strong>
            </div>
          </article>
          <article className="detail-card">
            <span className="detail-icon wind-icon" aria-hidden="true">↗</span>
            <div>
              <p>Wind</p>
              <strong>{Math.round(weather.current.wind_speed_10m)} <small>km/h</small></strong>
            </div>
          </article>
          <article className="detail-card">
            <span className="detail-icon feels-icon" aria-hidden="true">◉</span>
            <div>
              <p>Feels like</p>
              <strong>{Math.round(weather.current.apparent_temperature)}°</strong>
            </div>
          </article>
        </section>

        <section className="forecast-section" aria-labelledby="hourly-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Plan your day</p>
              <h2 id="hourly-heading">Hourly forecast</h2>
            </div>
            <span className="section-note">Next 12 hours</span>
          </div>
          <div className="hourly-list">
            {next12Hours.map((hour, index) => {
              const info = getWeatherInfo(hour.weatherCode);

              return (
                <article
                  key={hour.time}
                  className={`hour-card${index === 0 ? " hour-card-current" : ""}`}
                  aria-label={`${index === 0 ? "Now" : formatForecastTime(hour.time)}, ${Math.round(hour.temperature)} degrees, ${info.description}`}
                >
                  <p className="hour-time">
                    {index === 0 ? "Now" : formatForecastTime(hour.time)}
                  </p>
                  <span className="hour-icon" aria-hidden="true">{info.icon}</span>
                  <p className="hour-temperature">{Math.round(hour.temperature)}°</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="forecast-section weekly-section" aria-labelledby="weekly-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The week ahead</p>
              <h2 id="weekly-heading">7-day forecast</h2>
            </div>
          </div>
          <div className="daily-list">
            {dailyForecast.map((day, index) => {
              const info = getWeatherInfo(day.weatherCode);
              const rangeStart =
                ((day.minTemperature - weekLow) / weekTemperatureRange) * 100;
              const rangeWidth = Math.max(
                ((day.maxTemperature - day.minTemperature) /
                  weekTemperatureRange) *
                  100,
                4,
              );

              return (
                <article className="daily-row" key={day.date}>
                  <span className="daily-day">
                    {index === 0 ? "Today" : formatForecastDate(day.date)}
                  </span>
                  <span className="daily-condition">
                    <span aria-hidden="true">{info.icon}</span>
                    <span>{info.description}</span>
                  </span>
                  <span className="daily-low">{Math.round(day.minTemperature)}°</span>
                  <span className="temperature-range" aria-label="Temperature range">
                    <span className="range-track">
                      <span
                        className="range-fill"
                        style={{
                          left: `${rangeStart}%`,
                          width: `${rangeWidth}%`,
                        }}
                      />
                    </span>
                  </span>
                  <strong className="daily-high">{Math.round(day.maxTemperature)}°</strong>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="site-footer">
          <span>Weather for wherever you are.</span>
          <span>Powered by Open-Meteo</span>
        </footer>
      </div>
    </main>
  );
}
