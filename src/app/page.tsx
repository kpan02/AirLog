// src/app/page.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Toaster} from "sonner";

import AddFlightForm from "./flights/AddFlightForm";
import FlightTable from "./flights/FlightTable";
import EditFlightForm from "./flights/EditFlightForm";

export default function Home() {
  const [open, setOpen] = useState(false);

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
            <AddFlightForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <FlightTable onAddFlight={() => setOpen(true)} />

      <Toaster
        position="top-center"
        duration={2000}
        richColors
      />
    </main>
  );
}
