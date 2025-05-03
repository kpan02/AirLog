// src/app/flights/Overview.tsx
"use client";

import React from "react";

type OverviewProps = {
    numFlights: number;
    numAirports: number;
    numCountries: number;
    totalDistance: number; 
    timesAroundWorld: number;
    mostVisitedAirport: { code: string; name: string; count: number };
    topRoute: { from: string; to: string; count: number };
    longestFlight: { from: string; to: string; distance: number }; // distance in km
};

const Overview: React.FC<OverviewProps> = ({
    numFlights,
    numAirports,
    numCountries,
    totalDistance,
    timesAroundWorld,
    mostVisitedAirport,
    topRoute,
    longestFlight,
}) => {
    return (
        <section
            className="rounded-2xl p-4 pt-3 pl-5 mb-15 shadow-lg max-w-xl mx-auto"
            style={{
                background: "linear-gradient(135deg, #2b2e4a 0%, #1e90ff 100%)",
                color: "white",
            }}
        >
            <h1 className="text-xl mb-5 font-bold">Travel Overview</h1>

            <div className="grid grid-cols-9 gap-3 md:gap-6 mb-8 font-mono">
                {/* Flights */}
                <div className="col-span-2">
                    <div className="uppercase text-xs opacity-90">Flights</div>
                    <div className="text-3xl font-bold">{numFlights}</div>
                </div>
                {/* Airports */}
                <div className="col-span-2">
                    <div className="uppercase text-xs opacity-90">Airports</div>
                    <div className="text-3xl font-bold">{numAirports}</div>
                </div>
                {/* Countries */}
                <div className="col-span-2">
                    <div className="uppercase text-xs opacity-90">Countries</div>
                    <div className="text-3xl font-bold">{numCountries}</div>              
                </div>
                {/* Distance */}
                <div className="col-span-3">
                    <div className="uppercase text-xs opacity-90">Distance</div>
                    <div className="text-2xl font-bold">{totalDistance.toLocaleString()} mi</div>
                    <div className="text-xs opacity-60">{timesAroundWorld.toFixed(1)}x around the world</div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-3 md:gap-6 font-mono">
                {/* Most Visited Airport */}
                <div className="col-span-3">
                    <div className="uppercase text-xs opacity-90">Top Airport</div>
                    <div className="text-2xl font-bold">{mostVisitedAirport?.code || "-"}</div>
                    <div className="text-xs opacity-60">{mostVisitedAirport?.count ? `${mostVisitedAirport.count} times` : ""}</div>
                </div>
                {/* Top Routes */}
                <div className="col-span-4 pl-3">
                    <div className="uppercase text-xs opacity-90">Top Route</div>
                    <div className="text-2xl font-bold">{topRoute.from ? `${topRoute.from} → ${topRoute.to}` : "-"}</div>
                    <div className="text-xs opacity-60">{topRoute.count ? `${topRoute.count} times` : ""}</div>
                </div>
                {/* Longest Flight */}
                <div className="col-span-5 pl-10">
                    <div className="uppercase text-xs opacity-90">Longest Flight</div>
                    <div className="text-2xl font-bold">{longestFlight.from ? `${longestFlight.from} → ${longestFlight.to}` : "-"}</div>              
                    <div className="text-xs opacity-60">{longestFlight.distance ? `${longestFlight.distance.toLocaleString()} mi` : ""}</div>
                </div>
            </div>
        </section>
    );
};

export default Overview;
