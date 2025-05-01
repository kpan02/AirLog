"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from "react"
import { toast, Toaster } from "sonner"
import { Autocomplete } from "@mui/material"
import { TextField } from "@mui/material"
import { createFilterOptions } from "@mui/material/Autocomplete";

import dayjs from 'dayjs';
import { searchAirports, findAirportByCode } from "@/lib/airports";
import { Airport } from "@/data/types";

type AirportOption = {
  label: string;
  code: string;
  municipality?: string;
};

const filterAirports = createFilterOptions<AirportOption>();

export default function Home() {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [flightNumber, setFlightNumber] = useState("")
  const [departureAirport, setDepartureAirport] = useState("")
  const [arrivalAirport, setArrivalAirport] = useState("")

  const [departureOptions, setDepartureOptions] = useState<Airport[]>([]);
  const [arrivalOptions, setArrivalOptions] = useState<Airport[]>([]);

  const handleDepartureInput = (event: React.ChangeEvent<{}>, value: string) => {
    setDepartureAirport(value);
    if (value.trim() === "") {
      setDepartureOptions([]);
    } else {
      setDepartureOptions(searchAirports(value));
    }
  };
  
  const handleArrivalInput = (event: React.ChangeEvent<{}>, value: string) => {
    setArrivalAirport(value);
    if (value.trim() === "") {
      setArrivalOptions([]);
    } else {
      setArrivalOptions(searchAirports(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/flights', {
        method: 'POST',
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
  
      // Clear form on success
      setFlightNumber('');
      setDepartureAirport('');
      setArrivalAirport('');
      setDate(null);
      setDepartureOptions([]);
      setArrivalOptions([]);
      
      toast.success('Flight saved successfully!');
  
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save flight. Please try again.');
    }
  };

  return (
    <main className="container mx-auto p-4">

      {/* Notifications */}
      <Toaster 
        position="top-center"
        duration={2000}
        richColors
      />

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">AirLog✈️</CardTitle>
          <CardDescription className="text-center">Track your flights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    <TextField {...params} label="" size="small" required />
                  )}
                />

              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="arrivalAirport">
                  Arrival Airport
                  <span className="text-red-500 -ml-1.5">*</span>
                </Label>

                <Autocomplete
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
                    <TextField {...params} label="" size="small" required />
                  )}
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
                  maxDate={dayjs()}
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
                    }
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="text-xs text-gray-500 -mt-3 text-right">
              <span className="text-red-500">*</span> Required fields
            </div>

            <Button type="submit" className="w-full hover:scale-[1.01] bg-primary/75">
              Add Flight
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </main>
  )
}