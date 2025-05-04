// src/app/flights/EditFlightForm.tsx
"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from "react"
import { toast } from "sonner"
import { Autocomplete, TextField } from "@mui/material"
import { useEffect } from "react";

import dayjs from 'dayjs';
import { searchAirports, findAirportByCode } from "@/lib/airports";
import { Airport } from "@/data/types";
import type { Flight } from "./FlightTable";

type EditFlightFormProps = {
    flight: Flight | null;
    onSuccess?: () => void;
};

export default function EditFlightForm({ flight, onSuccess }: EditFlightFormProps) {
    const [date, setDate] = useState<dayjs.Dayjs | null>(null);
    const [flightNumber, setFlightNumber] = useState("")
    const [departureAirport, setDepartureAirport] = useState("")
    const [arrivalAirport, setArrivalAirport] = useState("")

    const [departureOptions, setDepartureOptions] = useState<Airport[]>([]);
    const [arrivalOptions, setArrivalOptions] = useState<Airport[]>([]);

    useEffect(() => {
        if (flight) {
            setFlightNumber(flight.flightNumber || "");
            setDepartureAirport(flight.departureAirport || "");
            setArrivalAirport(flight.arrivalAirport || "");
            setDate(dayjs(flight.date));
        }
    }, [flight]);

    const handleDepartureInput = (event: React.ChangeEvent<{}>, value: string) => { // eslint-disable-line @typescript-eslint/no-empty-object-type
        setDepartureAirport(value);
        if (value.trim() === "") {
            setDepartureOptions([]);
        } else {
            setDepartureOptions(searchAirports(value));
        }
    };
  
    const handleArrivalInput = (event: React.ChangeEvent<{}>, value: string) => { // eslint-disable-line @typescript-eslint/no-empty-object-type
        setArrivalAirport(value);
        if (value.trim() === "") {
            setArrivalOptions([]);
        } else {
            setArrivalOptions(searchAirports(value));
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`/api/flights/${flight?.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete flight');
            }

            setFlightNumber('');
            setDepartureAirport('');
            setArrivalAirport('');
            setDate(null);
            setDepartureOptions([]);
            setArrivalOptions([]);
            toast.success('Flight deleted successfully!');
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete flight. Please try again.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (!date || !departureAirport || !arrivalAirport) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!findAirportByCode(departureAirport.toUpperCase())) {
            toast.error('Invalid Departure Airport Code');
            return;
        }

        if (!findAirportByCode(arrivalAirport.toUpperCase())) {
            toast.error('Invalid Arrival Airport Code');
            return;
        }

        if (departureAirport === arrivalAirport) {
            toast.error('Departure and Arrival Airport cannot be the same');
            return;
        }
  
        try {
            const response = await fetch(`/api/flights/${flight?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    flightNumber,
                    departureAirport,
                    arrivalAirport,
                    date: date.format('YYYY-MM-DD'),
                }),
            });
  
            const data = await response.json();
  
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save flight');
            }
  
            setFlightNumber('');
            setDepartureAirport('');
            setArrivalAirport('');
            setDate(null);
            setDepartureOptions([]);
            setArrivalOptions([]);
      
            toast.success('Flight updated successfully!');
  
            if (onSuccess) onSuccess();
  
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save flight. Please try again.');
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input 
                    id="flightNumber"
                    placeholder="e.g., AA123"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                />
            </div>

            <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                    <Label htmlFor="departureAirport">
                        Departure Airport
                        <span className="text-red-500 -ml-1.5">*</span>      
                    </Label>

                    <Autocomplete
                        disablePortal
                        freeSolo
                        options={departureOptions.map((airport) => ({
                            label: `${airport.name} (${airport.iata_code})`,
                            code: airport.iata_code,
                            municipality: airport.municipality,
                        }))}
                        filterOptions={(options, { inputValue }) =>
                            options.filter((option) => {
                                const search = inputValue.toLowerCase();
                                return (
                                    option.code.toLowerCase().includes(search) ||
                                    option.label.toLowerCase().includes(search) ||
                                    (option.municipality && option.municipality.toLowerCase().includes(search))
                                );
                            })
                        }
                        inputValue={departureAirport}
                        getOptionLabel={(option) => {
                            if (typeof option === "string") return option;
                            return option.code;
                        }}
                        onInputChange={(_, value) => handleDepartureInput(_, value)}
                        onChange={(_, value) => {
                            if (typeof value === "string") {
                                setDepartureAirport(value);
                            } else if (value && typeof value === "object" && "code" in value) {
                                setDepartureAirport(value.code);
                            } else {
                                setDepartureAirport("");
                            }
                        }}
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;
                            return (
                                <li key={key} {...rest} className="text-sm px-2 py-1 hover:bg-gray-100 cursor-pointer">
                                    {option.label}
                                </li>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField {...params} size="small" helperText="" />
                        )}
                        slotProps={{
                            popper: {
                                style: {
                                    zIndex: 13000,
                                }
                            },
                            paper: {
                                style: {
                                    //   zIndex: 13000,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }
                            }
                        }}
                    />

                </div>

                <div className="space-y-2 flex-1">
                    <Label htmlFor="arrivalAirport">
                        Arrival Airport
                        <span className="text-red-500 -ml-1.5">*</span>
                    </Label>

                    <Autocomplete
                        disablePortal
                        freeSolo
                        options={arrivalOptions.map((airport) => ({
                            label: `${airport.name} (${airport.iata_code})`,
                            code: airport.iata_code,
                            municipality: airport.municipality,
                        }))}
                        filterOptions={(options, { inputValue }) =>
                            options.filter((option) => {
                                const search = inputValue.toLowerCase();
                                return (
                                    option.code.toLowerCase().includes(search) ||
                                    option.label.toLowerCase().includes(search) ||
                                    (option.municipality && option.municipality.toLowerCase().includes(search))
                                );
                            })
                        }
                        inputValue={arrivalAirport}
                        getOptionLabel={(option) => {
                            if (typeof option === "string") return option;
                            return option.code;
                        }}
                        onInputChange={(_, value) => handleArrivalInput(_, value)}
                        onChange={(_, value) => {
                            if (typeof value === "string") {
                                setArrivalAirport(value);
                            } else if (value && typeof value === "object" && "code" in value) {
                                setArrivalAirport(value.code);
                            } else {
                                setArrivalAirport("");
                            }
                        }}
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;
                            return (
                                <li key={key} {...rest} className="text-sm px-2 py-1 hover:bg-gray-100 cursor-pointer">
                                    {option.label}
                                </li>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="" size="small" />
                        )}
                        slotProps={{
                            popper: {
                                style: {
                                    zIndex: 13000,
                                }
                            },
                            paper: {
                                style: {
                                    //   zIndex: 13000,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }
                            }
                        }}
                    />

                </div>
            </div>
    
            <div className="space-y-2">
                <Label>
                    Date
                    <span className="text-red-500 -ml-1.5">*</span>
                </Label>
        
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        className="w-full"
                        minDate={dayjs('2015-01-01')}
                        maxDate={dayjs().endOf('year').add(1, 'year')}
                        views={['year', 'month', 'day']}
                        yearsOrder="desc"
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: "small",
                            },
                            field: {
                                clearable: true,
                            },
                            popper: {
                                disablePortal: true,
                            }
                        }}
                    />
                </LocalizationProvider>
            </div>

            <div className="text-xs text-gray-500 -mt-3 text-right">
                <span className="text-red-500">*</span> Required fields
            </div>
    
            <div className="flex justify-end mt-7">
                <Button type="submit" className="w-[48%] p-2 hover:scale-[1.01] bg-primary/75 cursor-pointer">
                    Update Flight
                </Button>
                <Button
                    type="button"
                    className="w-[48%] p-2 hover:scale-[1.01] bg-red-500 cursor-pointer ml-[4%]"
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </div>
        </form>
    )
}