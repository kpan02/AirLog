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

export default function Home() {
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [flightNumber, setFlightNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ 
      flightNumber, 
      date: date?.format('YYYY-MM-DD') 
    })
  }

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