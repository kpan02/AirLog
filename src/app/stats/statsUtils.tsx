import dayjs from "dayjs";
import type { Flight } from "../flights/FlightTable";
import { getCountry, findAirportByCode, calculateDistance } from "@/lib/airports";

// Helper to group flights
export function getFlightsPerData(flights: Flight[], mode: "year" | "month" | "weekday") {
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
    return Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, value]) => ({ label, value }));
}

export function getRouteDistances(flights: Flight[], order: "desc" | "asc" = "desc") {
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

export function getAirportVisits(flights: Flight[], order: "desc" | "asc" = "desc") {
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

export function getUniqueCountryCodes(flights: Flight[]): string[] {
  const codes = new Set<string>();
  flights.forEach(flight => {
    const depCountry = getCountry(flight.departureAirport);
    const arrCountry = getCountry(flight.arrivalAirport);
    if (depCountry && depCountry.length === 2) codes.add(depCountry.toUpperCase());
    if (arrCountry && arrCountry.length === 2) codes.add(arrCountry.toUpperCase());
  });
  return Array.from(codes);
} 