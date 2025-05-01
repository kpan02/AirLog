// src/app/page.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import AddFlightForm from "./flights/AddFlightForm";
import FlightTable from "./flights/FlightTable";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-5xl font-bold text-center">AirLog</h1>
      <p className="text-gray-500 text-center mt-2 mb-8">Track your flights</p>
      <div className="flex justify-end mb-4">
        

        <Dialog open={open} onOpenChange={setOpen}>
          {/* <DialogTrigger asChild>
            <Button className="bg-primary/75 hover:scale-[1.01]">Add Flight</Button>
          </DialogTrigger> */}
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
