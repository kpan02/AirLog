//src/app/flights/FlightTable.tsx
"use client";

import { useState } from "react";
import { findAirportByCode, searchAirports } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Autocomplete, TextField, MenuItem } from "@mui/material";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import dayjs from "dayjs";

import EditFlightForm from "./EditFlightForm";

export type Flight = {
    id: string;
    flightNumber: string | null;
    departureAirport: string;
    arrivalAirport: string;
    date: string;
};

type AirportOption = {
    code: string;
    label: string;
};

export default function FlightTable({ 
  onAddFlight,
  flights,
  loading,
  error,
  fetchFlights
}: { 
  onAddFlight: () => void;
  flights: Flight[];
  loading: boolean;
  error: string | null;
  fetchFlights: () => Promise<void>;
}) {
    // Remove local state for flights, loading, error
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [year, setYear] = useState<string | null>(null);
    const [from, setFrom] = useState<string | null>(null);
    const [to, setTo] = useState<string | null>(null);
    const [fromOptions, setFromOptions] = useState<AirportOption[]>([]);
    const [toOptions, setToOptions] = useState<AirportOption[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

    // Get unique years from flights
    const years = Array.from(
        new Set(flights.map(f => new Date(f.date).getFullYear().toString()))
    ).sort((a, b) => b.localeCompare(a));
    
    // Filtering logic
    let filteredFlights = flights;
    if (year) filteredFlights = filteredFlights.filter(f => new Date(f.date).getFullYear().toString() === year);
    if (from) filteredFlights = filteredFlights.filter(f => f.departureAirport === from);
    if (to) filteredFlights = filteredFlights.filter(f => f.arrivalAirport === to);
    
    // Sorting logic
    filteredFlights = [...filteredFlights].sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return sortDir === "asc" ? cmp : -cmp;
    });
    
    if (loading) return <div className="flex justify-center items-center mt-12">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    
    // Common styles
    const commonTextFieldStyles = {
        width: 100,
        background: "#f3f4f6",
        borderRadius: 1,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
    };
    
    const commonAutocompleteStyles = {
        width: 100,
        background: "#f3f4f6",
        color: "black",
        borderRadius: 1,
        '& .MuiOutlinedInput-root': { color: 'black', background: "#f3f4f6" },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d1d5db' },
        '& .MuiInputLabel-root': { color: 'black' },
        '& .MuiSvgIcon-root': { color: 'black' },
    };
    
    return (
        <div className="max-w-xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-2 mb-4 px-0 py-0">
                {/* 1. Date Sort */}
                <button
                    type="button"
                    onClick={() => setSortDir(dir => (dir === "asc" ? "desc" : "asc"))}
                    className="w-full md:w-[70px] h-9 md:h-10 bg-gray-100 text-black border border-gray-200 rounded-md text-sm md:text-base flex items-center justify-center transition-colors"
                    style={{ fontSize: '0.95rem' }}
                >
                    Date {sortDir === "asc" ? "↑" : "↓"}
                </button>
                
                {/* 2. Year Filter */}
                <TextField
                    select
                    label=""
                    size="small"
                    variant="outlined"
                    value={year ?? ""}
                    onChange={e => setYear(e.target.value || null)}
                    slotProps={{
                        select: { displayEmpty: true },
                        inputLabel: { style: { color: "black" } },
                        input: { style: { color: "black" } },
                    }}
                    sx={{ ...commonTextFieldStyles, width: '100%', '@media (min-width: 768px)': { width: 100 } }}
                >
                    <MenuItem value="">Year</MenuItem>
                    {years.map(y => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                </TextField>
                
                {/* 3. From Filter */}
                <Autocomplete
                    size="small"
                    sx={{ ...commonAutocompleteStyles, width: '100%', '@media (min-width: 768px)': { width: 100 } }}
                    options={fromOptions}
                    inputValue={from ?? ""}
                    onInputChange={(_, value) => {
                        setFrom(value);
                        setFromOptions(
                            value
                                ? searchAirports(value).map(a => ({
                                    code: a.iata_code,
                                    label: `${a.iata_code} - ${a.name}`,
                                }))
                                : []
                        );
                    }}
                    onChange={(_, value) => setFrom(value ? (typeof value === "string" ? value : value.code) : null)}
                    getOptionLabel={option => (typeof option === "string" ? option : option.code)}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label="From"
                            slotProps={{
                                inputLabel: { style: { color: "black" } },
                            }}
                        />
                    )}
                    clearOnBlur
                    freeSolo
                />
                
                {/* 4. To Filter */}
                <Autocomplete
                    size="small"
                    sx={{ ...commonAutocompleteStyles, width: '100%', '@media (min-width: 768px)': { width: 100 } }}
                    options={toOptions}
                    inputValue={to ?? ""}
                    onInputChange={(_, value) => {
                        setTo(value);
                        setToOptions(
                            value
                                ? searchAirports(value).map(a => ({
                                    code: a.iata_code,
                                    label: `${a.iata_code} - ${a.name}`,
                                }))
                                : []
                        );
                    }}
                    onChange={(_, value) => setTo(value ? (typeof value === "string" ? value : value.code) : null)}
                    getOptionLabel={option => (typeof option === "string" ? option : option.code)}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label="To"
                            slotProps={{
                                inputLabel: { style: { color: "black" } },
                            }}
                        />
                    )}
                    clearOnBlur
                    freeSolo
                />
                
                {/* 5. Add Flight Button */}
                <Button
                    onClick={onAddFlight}
                    className="ml-auto h-9 bg-black text-white hover:bg-gray-800 cursor-pointer w-full md:w-auto mt-2 md:mt-0"
                >
                    + Add Flight
                </Button>
            </div>
            
            {/* Flight Cards */}
            <div className="space-y-4 border-gray-300 p-0 font-mono">
                {filteredFlights.map((flight) => {
                    const dep = findAirportByCode(flight.departureAirport);
                    const arr = findAirportByCode(flight.arrivalAirport);
                    
                    return (
                        <div
                            key={flight.id}
                            className="flex items-center justify-between bg-white rounded-lg shadow border border-gray-300 p-4 cursor-pointer"
                            onClick={() => {
                                setSelectedFlight(flight);
                                setEditModalOpen(true);
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xl md:text-3xl">✈️</span>
                                <div>
                                    <div className="flex items-center gap-2 text-base md:text-2xl font-bold">
                                        <span>{flight.departureAirport}</span>
                                        <span>→</span>
                                        <span>{flight.arrivalAirport}</span>
                                    </div>
                                    <div className="text-gray-500 text-[9px] md:text-sm">
                                        {dep && arr ? `${dep.municipality} to ${arr.municipality}` : ""}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="font-bold text-sm md:text-lg">
                                    {dayjs(flight.date).format("MMM DD, YYYY")}
                                </div>
                                <div className="text-gray-500 text-[9px] md:text-sm">
                                    {flight.flightNumber ? `${flight.flightNumber}` : ""}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end mb-4">
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-center">Edit Flight</DialogTitle>
                        </DialogHeader>
                        <EditFlightForm
                            flight={selectedFlight}
                            onSuccess={() => {
                                fetchFlights();
                                setEditModalOpen(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>


        </div>
    );
}
