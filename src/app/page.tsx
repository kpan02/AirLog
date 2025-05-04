// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Toaster} from "sonner";
import { useUser } from "@clerk/nextjs";

import AddFlightForm from "./flights/AddFlightForm";
import FlightTable from "./flights/FlightTable";
import Overview from "./flights/Overview";
import type { Flight } from "./flights/FlightTable";
import { calculateStats } from "./flights/utils";
import SignInPopup from "@/components/SignInPopup";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchFlights() {
    setLoading(true);
    setError(null);
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

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error === "Please sign in to view your flights") {
    return <SignInPopup />;
  }

  return (
    <main className="container mx-auto p-4">
      <img src="/airlog-logo.png" alt="AirLog" className="h-17 mx-auto" />
      <p className="text-gray-500 text-center mt-2 font-mono opacity-80">Track your flights</p>
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

      {/* Travel Overview Card */}
      <Overview {...calculateStats(flights)}/>

      <h2 className="text-3xl font-bold mb-5 mt-12 max-w-xl mx-auto">Flight Log</h2>
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
