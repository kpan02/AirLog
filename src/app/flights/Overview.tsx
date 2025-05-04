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
    showActions?: boolean;
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
    showActions = true,
}) => {
    return (
        <section
            className="rounded-2xl p-4 pt-3 pl-5 mb-8 shadow-lg max-w-xl mx-auto"
            style={{
                background: "linear-gradient(135deg, #2b2e4a 0%, #1e90ff 100%)",
                color: "white",
            }}
        >
            <h1 className="text-lg md:text-xl mb-4 md:mb-5 font-bold">Travel Overview</h1>

            <div className="grid grid-cols-9 gap-2 md:gap-6 mb-6 md:mb-8 font-mono">
                {/* Flights */}
                <div className="col-span-2">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Flights</div>
                    <div className="text-xl md:text-3xl font-bold">{numFlights}</div>
                </div>
                {/* Airports */}
                <div className="col-span-2">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Airports</div>
                    <div className="text-xl md:text-3xl font-bold">{numAirports}</div>
                </div>
                {/* Countries */}
                <div className="col-span-2">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Countries</div>
                    <div className="text-xl md:text-3xl font-bold">{numCountries}</div>              
                </div>
                {/* Distance */}
                <div className="col-span-3">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Distance</div>
                    <div className="text-base md:text-2xl font-bold">{totalDistance.toLocaleString()} mi</div>
                    <div className="text-[8px] md:text-xs opacity-60">{timesAroundWorld.toFixed(1)}x around the world</div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-2 md:gap-6 font-mono">
                {/* Most Visited Airport */}
                <div className="col-span-3">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Top Airport</div>
                    <div className="text-lg md:text-2xl font-bold">{mostVisitedAirport?.code || "-"}</div>
                    <div className="text-[10px] md:text-xs opacity-60">{mostVisitedAirport?.count ? `${mostVisitedAirport.count} times` : ""}</div>
                </div>
                {/* Top Routes */}
                <div className="col-span-4 pl-2 md:pl-5">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Top Route</div>
                    <div className="text-lg md:text-2xl font-bold">{topRoute.from ? `${topRoute.from}-${topRoute.to}` : "-"}</div>
                    <div className="text-[10px] md:text-xs opacity-60">{topRoute.count ? `${topRoute.count} times` : ""}</div>
                </div>
                {/* Longest Flight */}
                <div className="col-span-5 pl-4 md:pl-10">
                    <div className="uppercase text-[10px] md:text-xs opacity-90">Longest Flight</div>
                    <div className="text-lg md:text-2xl font-bold">{longestFlight.from ? `${longestFlight.from} → ${longestFlight.to}` : "-"}</div>              
                    <div className="text-[10px] md:text-xs opacity-60">{longestFlight.distance ? `${longestFlight.distance.toLocaleString()} mi` : ""}</div>
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
            <div className="flex justify-center gap-3 mt-8">
                <button
                    className={`
                        flex items-center justify-center
                        w-40 py-1
                        rounded-xl border border-white/20
                        bg-white/10 text-white text-sm md:text-base font-medium
                        shadow-sm backdrop-blur-md
                        transition hover:bg-white/20 hover:border-white/40
                        cursor-pointer
                    `}
                    onClick={() => window.location.href = "/stats"}
                >
                    All Flight Stats
                </button>
                <button
                    className={`
                        flex items-center justify-center
                        w-40 py-1
                        rounded-xl border border-white/20
                        bg-white/10 text-white text-sm md:text-base font-medium
                        shadow-sm backdrop-blur-md
                        transition hover:bg-white/20 hover:border-white/40
                        cursor-pointer
                    `}
                    onClick={() => window.location.href = "/map"}
                >
                    Flight Map
                </button>
            </div>
            )}
        </section>
    );
};

export default Overview;
