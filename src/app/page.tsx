// src/app/page.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddFlightForm from "./flights/AddFlightForm";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Flight Log</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/75 hover:scale-[1.01]">Add Flight</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Add Flight</DialogTitle>
            </DialogHeader>
            <AddFlightForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Toaster
        position="top-center"
        duration={2000}
        richColors
      />
    </main>
  );
}
