"use client";

import { useEffect, useRef, useState } from "react";
import { searchLocations } from "@/lib/openMeteo";

type Location = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

type SearchBarProps = {
  onLocationSelect: (location: Location) => void;
};

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const results = await searchLocations(query);

        if (isMounted) {
          setHasSearched(true);
          setLocations(results);
        }
      } catch {
        if (isMounted) {
          setHasSearched(false);
          setLocations([]);
          setError("Unable to search locations");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setLocations([]);
        setHasSearched(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setLocations([]);
    setHasSearched(false);
    setError("");
    setIsLoading(false);
  }

  return (
    <div ref={searchRef} className="search-wrap">
      <label className="sr-only" htmlFor="location-search">
        Search for a city
      </label>
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4 4" />
        </svg>
      </span>
      <input
        id="location-search"
        type="search"
        role="combobox"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search for a city..."
        autoComplete="off"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={locations.length > 0}
        aria-controls="location-results"
        className="search-input"
      />

      {isLoading && (
        <div className="search-feedback" role="status">
          Searching locations...
        </div>
      )}

      {error && (
        <div className="search-feedback search-error" role="alert">
          {error}
        </div>
      )}

      {locations.length > 0 && (
        <div
          className="search-results"
          id="location-results"
          role="listbox"
          aria-label="Location suggestions"
        >
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => {
                onLocationSelect(location);
                setQuery("");
                setLocations([]);
                setHasSearched(false);
                setError("");
              }}
              className="search-result"
            >
              <span className="result-pin" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
              </span>
              <span className="result-copy">
                <span className="result-name">{location.name}</span>
                <span className="result-region">
                  {location.admin1 ? `${location.admin1}, ` : ""}
                  {location.country}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {!isLoading &&
        hasSearched &&
        query.trim() &&
        locations.length === 0 &&
        !error && (
          <div className="search-results search-empty">
            <p className="empty-title">
              No locations found
            </p>
            <p className="empty-caption">
              Try a different spelling or city name.
            </p>
          </div>
        )}
    </div>
  );
}
