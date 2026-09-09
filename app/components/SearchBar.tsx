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
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setLocations([]);
      setError("");
      setHasSearched(false);
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search for a city..."
        className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm outline-none transition focus:border-slate-400"
      />

      {isLoading && (
        <div className="mt-2 text-sm text-slate-500">Searching...</div>
      )}

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {locations.length > 0 && (
        <div className="absolute left-0 right-0 top-14 z-10 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => {
                onLocationSelect(location);
                setQuery(location.name);
                setLocations([]);
              }}
              className="block w-full rounded-xl px-4 py-3 text-left hover:bg-slate-50"
            >
              <div className="font-medium">{location.name}</div>

              <div className="text-sm text-slate-500">
                {location.admin1 ? `${location.admin1}, ` : ""}
                {location.country}
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoading &&
        hasSearched &&
        query.trim() &&
        locations.length === 0 &&
        !error && (
          <div className="absolute left-0 right-0 top-14 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-lg">
            <p className="text-sm font-medium text-slate-700">
              No locations found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try a different spelling or city name.
            </p>
          </div>
        )}
    </div>
  );
}
