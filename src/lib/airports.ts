// src/lib/airports.ts
import { airports } from '@/data/airports';
import { Airport } from '@/data/types';

export function findAirportByCode(code: string): Airport | undefined {
    return airports.find(a => a.iata_code === code);
}

export function searchAirports(query: string): Airport[] {
    const searchTerm = query.toUpperCase();
    return airports.filter(a => 
      a.name.toUpperCase().includes(searchTerm) ||
      a.municipality.toUpperCase().includes(searchTerm) ||
      a.iata_code.toUpperCase().includes(searchTerm)
    );
}

export function calculateDistance(a1: Airport, a2: Airport): number {
    const earthRadius = 3959; //miles
    
    const lat1 = a1.latitude_deg * (Math.PI / 180);
    const lon1 = a1.longitude_deg * (Math.PI / 180);
    const lat2 = a2.latitude_deg * (Math.PI / 180);
    const lon2 = a2.longitude_deg * (Math.PI / 180);
  
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    // Haversine formula
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadius * c * 100) / 100;
}

export function getCountry(code: string): string {
    console.log("getCountry", code);
    const airport = findAirportByCode(code);
    console.log("airport", airport);
    return airport?.iso_country || "Unknown";
}
