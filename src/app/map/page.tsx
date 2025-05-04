// src/app/map/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import SignInPopup from "@/components/SignInPopup";
import type { Flight } from "../flights/FlightTable";

const Map = dynamic(() => import("./FlightMap"), { ssr: false });

export default function MapPage() {
    const { isLoaded, isSignedIn } = useUser();
    const [flights, setFlights] = useState<Flight[]>([]);
    const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
    const [error, setError] = useState<string | null>(null);

    async function fetchFlights() {
        try {
            const res = await fetch("/api/flights");
            if (!res.ok) {
                if (res.status === 401) {
                    setError("Please sign in to view your flights");
                    return;
                }
                throw new Error("Failed to fetch flights");
            }
            const data = await res.json();
            setFlights(data.data || []);
        } catch {
            setError("Failed to load flights. Please try again.");
            setFlights([]);
        }
    }

    useEffect(() => {
        if (isSignedIn) {
            fetchFlights();
        }
    }, [isSignedIn]);

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isSignedIn) {
        return <SignInPopup />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

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
                <Image 
                    src="/airlog-logo.png" 
                    alt="AirLog" 
                    width={220}
                    height={68}
                    className="h-17 mx-auto" 
                />

                <div className="flex justify-center mt-3">
                    <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block font-mono">
                        ← Return to Flight Log
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
                <div className="h-[600px] w-full">
                    <Map flights={filteredFlights} />
                </div>
            </div>
        </main>
    );
}
