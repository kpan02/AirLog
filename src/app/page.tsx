// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Toaster} from "sonner";

import AddFlightForm from "./flights/AddFlightForm";
import FlightTable from "./flights/FlightTable";
import type { Flight } from "./flights/FlightTable";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFlights() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error("Failed to fetch flights");
      const data = await res.json();
      setFlights(data.data || []);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError("Failed to load flights. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFlights();
  }, []);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-6xl font-bold text-center">AirLog</h1>
      <p className="text-gray-500 text-center mt-2 mb-8">Track your flights</p>
      <div className="h-4" />
      
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Add Flight</DialogTitle>
            </DialogHeader>
            <AddFlightForm 
              onSuccess={() => {
                fetchFlights();
                setOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <FlightTable 
        onAddFlight={() => setOpen(true)}
        flights={flights}
        loading={loading}
        error={error}
        fetchFlights={fetchFlights}
      />

      <Toaster
        position="top-center"
        duration={2000}
        richColors
      />
    </main>
  );
}
