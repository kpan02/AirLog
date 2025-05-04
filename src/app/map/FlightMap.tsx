"use client";

import { MapContainer, TileLayer, LayersControl, Polyline, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Flight } from "../flights/FlightTable";
import { findAirportByCode } from "@/lib/airports";
import { useState } from "react";
import React from "react";

export default function FlightMap({ flights }: { flights: Flight[] }) {
  const [activeBaseLayer, setActiveBaseLayer] = useState<"Satellite" | "Street">("Satellite");

  return (
    <section className="w-full">
      <MapContainer
        center={[20, 0] as [number, number]}
        zoom={1}
        style={{ width: "100%", height: 400, borderRadius: 12, overflow: "hidden" }}
        scrollWheelZoom={true}
        attributionControl={true}
        zoomControl={false}
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution=""
              maxZoom={18}
              eventHandlers={{
                add: () => setActiveBaseLayer("Satellite"),
              }}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
              attribution=""
              eventHandlers={{
                add: () => setActiveBaseLayer("Street"),
              }}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {/* Flight Paths  */}
        {flights.map((flight, idx) => {
          const origin = findAirportByCode(flight.departureAirport);
          const destination = findAirportByCode(flight.arrivalAirport);

          if (!origin || !destination) return null;

          return (
            <React.Fragment key={idx}>
              {/* Dots for airports */}
              <CircleMarker
                center={[origin.latitude_deg, origin.longitude_deg]}
                radius={3}
                pathOptions={{
                  fillColor: activeBaseLayer === "Satellite" ? "white" : "#2272c7",
                  fillOpacity: 1,
                  weight: 0,
                }}
              />
              <CircleMarker
                center={[destination.latitude_deg, destination.longitude_deg]}
                radius={3}
                pathOptions={{
                  fillColor: activeBaseLayer === "Satellite" ? "white" : "#2272c7",
                  fillOpacity: 1,
                  weight: 0,
                }}
              />

              {/* Polyline for the flight path */}
              <Polyline
                positions={[
                  [origin.latitude_deg, origin.longitude_deg],
                  [destination.latitude_deg, destination.longitude_deg]
                ]}
                pathOptions={{
                  color: activeBaseLayer === "Satellite" ? "white" : "#2272c7",
                  weight: 2,
                  opacity: 1
                }}
              >
                <Popup>
                  <div style={{ fontSize: 12 }}>
                    <strong>
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </strong>
                    <br />
                    {flight.date && <span>{new Date(flight.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>}
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </section>
  );
}
