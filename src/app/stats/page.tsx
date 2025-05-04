// src/app/stats/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Flight } from "../flights/FlightTable";
import Overview from "../flights/Overview";
import { calculateStats } from "../flights/utils";
import { getCountry, findAirportByCode, calculateDistance } from "@/lib/airports";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { getFlightsPerData, getRouteDistances, getAirportVisits, getUniqueCountryCodes } from "./statsUtils";

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

    const years = Array.from(
        new Set(flights.map(flight => new Date(flight.date).getFullYear()))
    ).sort((a, b) => b - a);

    // Filter flights by year
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
                    <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block font-mono">
                    🡨 Return to Flight Log
                    </Link>
                </div>

                {/* Year Selector */}
                <div className="flex mt-3 mb-3 gap-3 items-center">
                  <div className="relative">
                    <select
                      id="year"
                      className="appearance-none bg-white border border-gray-300 rounded-full px-3 py-1 pr-8 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition cursor-pointer"
                      value={selectedYear}
                      onChange={e =>
                        setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
                      }
                    >
                      <option value="all">All Time</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Overview Card*/}
                <Overview {...calculateStats(filteredFlights)} showActions={false} />
                
                {/* Flights (count) Section */}
                <section className="mb-8 rounded-xl border p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-5 text-center">Flights</h2>
                    <div className="flex gap-4 text-md font-mono justify-between">
                        <span><span className="font-bold">{domesticCount}</span> Domestic</span>
                        <span><span className="font-bold">{internationalCount}</span> International</span>
                        <span><span className="font-bold">{longHaulCount}</span> Long-haul</span>
                    </div>
                </section>

                {/* Flights Per Section */}
                <section className="mb-8 rounded-xl border p-6 shadow-sm">
                    <div className="flex justify-center mb-2">
                        <h2 className="text-2xl font-bold">Flights Per</h2>
                    </div>
                    <div className="flex justify-center gap-4 mb-5">
                        {["year", "month", "weekday"].map(mode => (
                            <button
                                key={mode}
                                className={`px-3 py-1 rounded-full font-mono text-sm cursor-pointer ${
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
                <section className="mb-8 rounded-xl border p-6 shadow-sm">
                    <div className="flex justify-center mb-2">
                        <h2 className="text-2xl font-bold">Distance</h2>
                    </div>
                    <div className="flex justify-center gap-2 mb-5">
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm cursor-pointer ${
                                distanceSort === "desc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setDistanceSort("desc")}
                        >
                            Longest
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm cursor-pointer ${
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
                <section className="mb-8 rounded-xl border p-6 shadow-sm">
                    <div className="flex justify-center mb-2">
                        <h2 className="text-2xl font-bold">Airports Visited</h2>
                    </div>
                    <div className="flex justify-center gap-2 mb-5">
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm cursor-pointer ${
                                airportSort === "desc" ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => setAirportSort("desc")}
                        >
                            Most
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full font-mono text-sm cursor-pointer ${
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
                <section className="mb-8 rounded-xl border p-6 shadow-sm">
                    <div className="flex justify-center mb-2">
                        <h2 className="text-2xl font-bold">Countries</h2>
                    </div>
                    <p className="text-sm mb-5 font-mono mb-8 italic text-center">You've visited {((uniqueCountryCodes.length / 195) * 100).toFixed(1)}% of the world's countries!</p>
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