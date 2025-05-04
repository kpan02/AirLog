// src/app/map/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Flight } from "../flights/FlightTable";
import dynamic from "next/dynamic";

// Dynamically import FlightMap with SSR disabled
const FlightMap = dynamic(() => import("./FlightMap"), { ssr: false });

export default function MapPage() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<"all" | number>("all");

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
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">Flight Map</h2>
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

                {/* Map Section */}
                <FlightMap flights={filteredFlights} />
            </div>
        </main>
    );
}
