// src/app/flights/utils.ts
"use client";

import { calculateDistance, getCountry, findAirportByCode } from "@/lib/airports";

export type Flight = {
    id: string;
    flightNumber: string | null;
    departureAirport: string;
    arrivalAirport: string;
    date: string;
};

export type FlightStats = {
    numFlights: number;
    numAirports: number;
    numCountries: number;
    totalDistance: number;
    timesAroundWorld: number;
    mostVisitedAirport: { code: string; name: string; count: number };
    topRoute: { from: string; to: string; count: number };
    longestFlight: { from: string; to: string; distance: number };
};

export function calculateStats(flights: Flight[]): FlightStats {
    const airports = new Set<string>();
    const countries = new Set<string>();
    const airportVisitCounts: Record<string, number> = {};
    const routeCounts: Record<string, number> = {};
    
    let totalDistance = 0;
    let longestDistance = 0;
    let longestFlight = { from: "", to: "" };

    flights.forEach(flight => {
        const { departureAirport, arrivalAirport } = flight;
        
        // Store unique airports and their countries
        [departureAirport, arrivalAirport].forEach(code => {
            airports.add(code);
            countries.add(getCountry(code));
            airportVisitCounts[code] = (airportVisitCounts[code] || 0) + 1;
        });

        // Store routes
        const route = [departureAirport, arrivalAirport].sort().join("→");
        routeCounts[route] = (routeCounts[route] || 0) + 1;

        // Calculate distance
        const departure = findAirportByCode(departureAirport);
        const arrival = findAirportByCode(arrivalAirport);
        if (departure && arrival) {
            const distance = calculateDistance(departure, arrival);
            totalDistance += distance;
            if (distance > longestDistance) {
                longestDistance = distance;
                longestFlight = { from: departureAirport, to: arrivalAirport };
            }
        }
    });

    // Find most visited airport
    const [mostVisitedAirportCode, mostVisitedAirportCount] = Object.entries(airportVisitCounts)
        .reduce(([prevCode, prevCount], [code, count]) => 
            count > prevCount ? [code, count] : [prevCode, prevCount], 
            ["", 0]
        );

    // Find top route
    const [topRoute, topRouteCount] = Object.entries(routeCounts)
        .reduce(([prevRoute, prevCount], [route, count]) => 
            count > prevCount ? [route, count] : [prevRoute, prevCount], 
            ["", 0]
        );
    const [topRouteFrom, topRouteTo] = topRoute.split("→");

    const mostVisitedAirportName = findAirportByCode(mostVisitedAirportCode)?.name || mostVisitedAirportCode;

    return {
        numFlights: flights.length,
        numAirports: airports.size,
        numCountries: countries.size,
        totalDistance: Math.round(totalDistance),
        timesAroundWorld: totalDistance / 24901.46,
        mostVisitedAirport: { code: mostVisitedAirportCode, name: mostVisitedAirportName, count: mostVisitedAirportCount },
        topRoute: { from: topRouteFrom, to: topRouteTo, count: topRouteCount },
        longestFlight: { from: longestFlight.from, to: longestFlight.to, distance: Math.round(longestDistance) },
    };
}
