// src/app/stats/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Flight } from "../flights/FlightTable";
import Overview from "../flights/Overview";
import { calculateStats } from "../flights/utils";
import { getCountry, findAirportByCode, calculateDistance } from "@/lib/airports";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import dayjs from "dayjs";

// Helper to group flights
function getFlightsPerData(flights: Flight[], mode: "year" | "month" | "weekday") {
    const counts: Record<string, number> = {};
    flights.forEach(flight => {
        const date = dayjs(flight.date);
        let key = "";
        if (mode === "year") key = date.format("YYYY");
        if (mode === "month") key = date.format("MMM");
        if (mode === "weekday") key = date.format("ddd");
        counts[key] = (counts[key] || 0) + 1;
    });

    // For month and weekday, ensure all are present in order
    if (mode === "month") {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return months.map(m => ({ label: m, value: counts[m] || 0 }));
    }
    if (mode === "weekday") {
        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        return days.map(d => ({ label: d, value: counts[d] || 0 }));
    }
    // For year, sort descending
    return Object.entries(counts)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([label, value]) => ({ label, value }));
}

function getRouteDistances(flights: Flight[], order: "desc" | "asc" = "desc") {
  const routeMap: Record<string, { from: string, to: string, distance: number }> = {};
  flights.forEach(flight => {
    const dep = findAirportByCode(flight.departureAirport);
    const arr = findAirportByCode(flight.arrivalAirport);
    if (!dep || !arr) return;
    const routeKey = [flight.departureAirport, flight.arrivalAirport].sort().join("-");
    const distance = calculateDistance(dep, arr);
    if (!routeMap[routeKey] || distance > routeMap[routeKey].distance) {
      routeMap[routeKey] = {
        from: flight.departureAirport,
        to: flight.arrivalAirport,
        distance,
      };
    }
  });
  // Sort by distance
  const sorted = Object.values(routeMap).sort((a, b) =>
    order === "desc" ? b.distance - a.distance : a.distance - b.distance
  );
  return sorted
    .slice(0, 10)
    .map(route => ({
      route: `${route.from}-${route.to}`,
      distance: Math.round(route.distance),
    }));
}

function getAirportVisits(flights: Flight[], order: "desc" | "asc" = "desc") {
  const airportCounts: Record<string, number> = {};
  flights.forEach(flight => {
    airportCounts[flight.departureAirport] = (airportCounts[flight.departureAirport] || 0) + 1;
    airportCounts[flight.arrivalAirport] = (airportCounts[flight.arrivalAirport] || 0) + 1;
  });
  const sorted = Object.entries(airportCounts)
    .sort((a, b) => order === "desc" ? b[1] - a[1] : a[1] - b[1])
    .slice(0, 10) // Top 10 airports
    .map(([code, count]) => ({
      code,
      count,
    }));
  return sorted;
}

function getUniqueCountryCodes(flights: Flight[]): string[] {
  const codes = new Set<string>();
  flights.forEach(flight => {
    const depCountry = getCountry(flight.departureAirport);
    const arrCountry = getCountry(flight.arrivalAirport);
    if (depCountry && depCountry.length === 2) codes.add(depCountry.toUpperCase());
    if (arrCountry && arrCountry.length === 2) codes.add(arrCountry.toUpperCase());
  });
  return Array.from(codes);
}

export default function StatsPage() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
    const [flightsPerMode, setFlightsPerMode] = useState<"year" | "month" | "weekday">("month");
    const [distanceSort, setDistanceSort] = useState<"desc" | "asc">("desc");
    const [airportSort, setAirportSort] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        async function fetchFlights() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/flights");
                if (!res.ok) throw new Error("Failed to fetch flights");
                const data = await res.json();
                setFlights(data.data || []);
            } catch (err) {
                setError("Failed to load flights. Please try again.");
                setFlights([]);
            } finally {
                setLoading(false);
            }
        }
        fetchFlights();
    }, []);

    // Extract years from flights
    const years = Array.from(
        new Set(flights.map(flight => new Date(flight.date).getFullYear()))
    ).sort((a, b) => b - a);

    // Filter flights based on selected year
    const filteredFlights =
        selectedYear === "all"
            ? flights
            : flights.filter(
                flight => new Date(flight.date).getFullYear() === selectedYear
            );

    const domesticCount = filteredFlights.filter(flight => {
        const depCountry = getCountry(flight.departureAirport);
        const arrCountry = getCountry(flight.arrivalAirport);
        return depCountry && arrCountry && depCountry === arrCountry;
    }).length;

    const internationalCount = filteredFlights.length - domesticCount;

    const longHaulCount = filteredFlights.filter(flight => {
        const dep = findAirportByCode(flight.departureAirport);
        const arr = findAirportByCode(flight.arrivalAirport);
        if (!dep || !arr) return false;
        const distance = calculateDistance(dep, arr);
        return distance >= 2500; // 2,500 miles threshold
    }).length;

    const flightsPerData = getFlightsPerData(filteredFlights, flightsPerMode);

    const routeDistances = getRouteDistances(filteredFlights, distanceSort);

    const airportVisits = getAirportVisits(filteredFlights, airportSort);
    const uniqueCountryCodes = getUniqueCountryCodes(filteredFlights);

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <main className="container mx-auto p-4">
            <div className="max-w-xl mx-auto">
                <img src="/airlog-logo.png" alt="AirLog" className="h-17 mx-auto" />

                <div className="flex justify-center mt-3">
                    <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
                    🡨 Return to Flight Log
                    </Link>
                </div>

                {/* Year Selector */}
                <div className="flex mt-3 mb-3 gap-2 items-center">
                    <label htmlFor="year" className="font-medium">Year:</label>
                    <select
                        id="year"
                        className="border rounded px-2 py-1"
                        value={selectedYear}
                        onChange={e =>
                            setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))
                        }
                    >
                        <option value="all">All Time</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Overview Card (filtered by year, no actions) */}
                <Overview {...calculateStats(filteredFlights)} showActions={false} />
                
                {/* Flights (count) Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-1">Flights</h2>
                    <div className="flex flex-col gap-1 text-md font-mono">
                        <span><span className="font-bold">{domesticCount}</span> Domestic</span>
                        <span><span className="font-bold">{internationalCount}</span> International</span>
                        <span><span className="font-bold">{longHaulCount}</span> Long-haul</span>
                    </div>
                </section>

                {/* Flights Per Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-2xl font-bold">Flights Per</h2>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                        {["year", "month", "weekday"].map(mode => (
                            <button
                                key={mode}
                                className={`px-3 py-1 rounded-full font-mono text-sm ${
                                    flightsPerMode === mode
                                        ? "bg-black text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => setFlightsPerMode(mode as any)}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={flightsPerData}>
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Bar dataKey="value" fill="#2272c7" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                {/* Distance Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Distance</h2>
                    <div className="flex gap-2 mb-2">
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm ${
                                distanceSort === "desc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setDistanceSort("desc")}
                        >
                            Longest
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm ${
                                distanceSort === "asc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setDistanceSort("asc")}
                        >
                            Shortest
                        </button>
                    </div>
                    <div className="w-full" style={{ minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={routeDistances}
                                layout="vertical"
                                margin={{ left: 40, right: 60, top: 10, bottom: 10 }}
                                barCategoryGap={18}
                            >
                                <YAxis
                                    dataKey="route"
                                    type="category"
                                    tick={{ fontSize: 18, fill: "black", fontFamily: "monospace" }}
                                    width={50}
                                />
                                <XAxis type="number" hide />
                                <Bar dataKey="distance" fill="#2272c7" radius={[0, 16, 16, 0]} barSize={24}>
                                    <LabelList
                                        dataKey="distance"
                                        position="right"
                                        formatter={(v: number) => `${v.toLocaleString()}\u00A0mi`}
                                        style={{ fill: "#bbb", fontSize: 15, fontFamily: "monospace" }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Airports Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Airports Visited</h2>
                    <div className="flex gap-2 mb-2">
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm ${
                                airportSort === "desc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setAirportSort("desc")}
                        >
                            Most
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm ${
                                airportSort === "asc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setAirportSort("asc")}
                        >
                            Least
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={airportVisits}
                            layout="vertical"
                            margin={{ left: 10, right: 60, top: 10, bottom: 10 }}
                            barCategoryGap={18}
                        >
                            <YAxis
                                dataKey="code"
                                type="category"
                                tick={{ fontSize: 18, fill: "black", fontFamily: "monospace" }}
                                width={50}
                            />
                            <XAxis type="number" hide />
                            <Bar dataKey="count" fill="#2272c7" radius={[0, 16, 16, 0]} barSize={24}>
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    formatter={(v: number) => `${v}\u00A0times`}
                                    style={{ fill: "#bbb", fontSize: 15, fontFamily: "monospace" }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                {/* Countries & Territories Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Countries</h2>
                    <p className="text-sm mb-5 font-mono mb-7 italic">You've visited {((uniqueCountryCodes.length / 195) * 100).toFixed(1)}% of the world's countries!</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {uniqueCountryCodes.map(code => (
                            <div key={code} className="flex flex-col items-center">
                                <img
                                    src={`https://flagcdn.com/48x36/${code.toLowerCase()}.png`}
                                    alt={code}
                                    width={32}
                                    height={24}
                                    style={{ borderRadius: 4 }}
                                />
                                <span className="text-sm mt-1 font-mono text-center font-bold">
                                    {new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}