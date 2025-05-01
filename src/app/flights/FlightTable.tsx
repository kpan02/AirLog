//src/app/flights/FlightTable.tsx
"use client";

import {useState, useEffect} from "react";
import { Airport } from "@/data/types";
import { findAirportByCode, searchAirports } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Autocomplete, TextField } from "@mui/material";

type Flight = {
  id: string;
  flightNumber: string | null;
  departureAirport: string;
  arrivalAirport: string;
  date: string;
};

type AirportOption = { code: string; label: string };

export default function FlightTable({ onAddFlight }: { onAddFlight: () => void }) {
  const widgetHeight = '0.78rem';

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/sort state
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [year, setYear] = useState<string | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  // Autocomplete options
  const [fromOptions, setFromOptions] = useState<AirportOption[]>([]);
  const [toOptions, setToOptions] = useState<AirportOption[]>([]);

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      const res = await fetch("/api/flights");
      const data = await res.json();
      setFlights(data.data || []);
      setLoading(false);
    }
    fetchFlights();
  }, []);

  // Get unique years from flights
  const years = Array.from(
    new Set(flights.map(f => new Date(f.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Filtering logic
  let filteredFlights = flights;
  if (year) filteredFlights = filteredFlights.filter(f => new Date(f.date).getFullYear().toString() === year);
  if (from) filteredFlights = filteredFlights.filter(f => f.departureAirport === from);
  if (to) filteredFlights = filteredFlights.filter(f => f.arrivalAirport === to);

  // Sorting logic
  filteredFlights = [...filteredFlights].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return sortDir === "asc" ? cmp : -cmp;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* 1. Date Sort */}
        <div className="border rounded px-2 py-1.5 text-sm flex items-center gap-1">
          <button
            type="button"
            className="text-sm flex items-center gap-1 cursor-pointer"
            onClick={() => setSortDir(dir => (dir === "asc" ? "desc" : "asc"))}
            title="Toggle sort direction"
          >
            Date {sortDir === "asc" ? "🡓" : "🡑"}
          </button>
        </div>

        {/* 2. Year Filter */}
        <select
          className="border rounded px-2 py-1.5 text-sm cursor-pointer"
          value={year ?? ""}
          onChange={e => setYear(e.target.value || null)}
        >
          <option value="">Year</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* 3. From Filter */}
        <Autocomplete
          size="small"
          sx={{
            width: 100,
            '& .MuiInputBase-input': {
              fontSize: widgetHeight,
            },
          }}
          options={fromOptions}
          inputValue={from ?? ""}
          onInputChange={(_, value) => {
            setFrom(value);
            setFromOptions(
              value
                ? searchAirports(value).map(a => ({
                    code: a.iata_code,
                    label: `${a.iata_code} - ${a.name}`,
                  }))
                : []
            );
          }}
          onChange={(_, value) => setFrom(value ? (typeof value === "string" ? value : value.code) : null)}
          getOptionLabel={option => (typeof option === "string" ? option : option.code)}
          renderInput={params => <TextField {...params} label="From" sx={{ '& .MuiInputLabel-root': { fontSize: widgetHeight } }} />}
          clearOnBlur
          freeSolo
        />

        {/* 4. To Filter */}
        <Autocomplete
          size="small"
          sx={{ width: 100,
            '& .MuiInputBase-input': {
              fontSize: widgetHeight,
            },
          }}
          options={toOptions}
          inputValue={to ?? ""}
          onInputChange={(_, value) => {
            setTo(value);
            setToOptions(
              value
                ? searchAirports(value).map(a => ({
                    code: a.iata_code,
                    label: `${a.iata_code} - ${a.name}`,
                  }))
                : []
            );
          }}
          onChange={(_, value) => setTo(value ? (typeof value === "string" ? value : value.code) : null)}
          getOptionLabel={option => (typeof option === "string" ? option : option.code)}
          renderInput={params => <TextField {...params} label="To" sx={{ '& .MuiInputLabel-root': { fontSize: widgetHeight } }} />}
          clearOnBlur
          freeSolo
        />

        {/* 5. Add Button */}
        <Button onClick={onAddFlight} className="ml-auto">
          + Add Flight
        </Button>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => {
          const dep = findAirportByCode(flight.departureAirport);
          const arr = findAirportByCode(flight.arrivalAirport);

          return (
            <div
              key={flight.id}
              className="flex items-center justify-between bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">❤️</span>
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <span>{flight.departureAirport}</span>
                    <span>→</span>
                    <span>{flight.arrivalAirport}</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {dep && arr
                      ? `${dep.municipality} to ${arr.municipality}`
                      : ""}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-bold text-lg">
                  {new Date(flight.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="text-gray-500 text-sm">
                  {flight.flightNumber ? `WN ${flight.flightNumber}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


