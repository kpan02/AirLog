// src/app/api/flights/route.ts
import { db } from '@/db';
import { flights } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

type InsertFlight = typeof flights.$inferInsert;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testQuery = await db.select().from(flights);
    return NextResponse.json({ success: true, data: testQuery });
  } catch (err) {
    const error = err as Error;
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightNumber, departureAirport, arrivalAirport, date } = await request.json();

    // Required fields
    if (!departureAirport || !arrivalAirport || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const newFlight: InsertFlight = {
      userId,
      flightNumber: flightNumber || '',
      departureAirport: departureAirport.toUpperCase(),
      arrivalAirport: arrivalAirport.toUpperCase(),
      date: formattedDate,
    };

    const insertedFlight = await db.insert(flights)
      .values(newFlight)
      .returning();

    return NextResponse.json({
      success: true,
      flight: insertedFlight[0]
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error saving flight:', error);
    return NextResponse.json({
      error: 'Failed to save flight',
      details: error.message
    }, { status: 500 });
  }
}