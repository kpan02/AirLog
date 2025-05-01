"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from "react"
import dayjs from 'dayjs';
import { searchAirports, findAirportByCode } from "@/lib/airports";

export default function Home() {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [flightNumber, setFlightNumber] = useState("")
  const [departureAirport, setDepartureAirport] = useState("")
  const [arrivalAirport, setArrivalAirport] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !departureAirport || !arrivalAirport) {
      alert('Please fill in all fields');
      return;
    }

    if (!findAirportByCode(departureAirport.toUpperCase())) {
      alert('Invalid departure airport code');
      return;
    }

    if (!findAirportByCode(arrivalAirport.toUpperCase())) {
      alert('Invalid arrival airport code');
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
        // TODO: Change error to a toast
      }
  
      // Clear form on success
      setFlightNumber('');
      setDepartureAirport('');
      setArrivalAirport('');
      setDate(null);
      
      // TODO: Change alert to a toast
      alert('Flight saved successfully!');
  
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save flight. Please try again.');
    }
  };

  return (
    <main className="container mx-auto p-4">
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
                <Label htmlFor="departureAirport">Departure Airport</Label>
                <Input 
                  id="departureAirport"
                  placeholder="e.g., LAX"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value)}
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="arrivalAirport">Arrival Airport</Label>
                <Input 
                  id="arrivalAirport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
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

            <Button type="submit" className="w-full">
              Add Flight
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}