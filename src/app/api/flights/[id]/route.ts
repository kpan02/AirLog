// src/app/api/flights/[id]/route.ts

import { db } from '@/db';
import { flights } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type InsertFlight = typeof flights.$inferInsert;

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = Number(context.params.id);

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flightNumber, departureAirport, arrivalAirport, date } = await request.json();

    const flightToUpdate = await db.select().from(flights).where(eq(flights.id, id));
    if (!flightToUpdate.length || flightToUpdate[0].userId !== userId) {
      return NextResponse.json({ error: 'Flight not found or unauthorized' }, { status: 404 });
    }

    const updateData: Partial<InsertFlight> = {};
    if (flightNumber !== undefined) updateData.flightNumber = flightNumber;
    if (departureAirport !== undefined) updateData.departureAirport = departureAirport.toUpperCase();
    if (arrivalAirport !== undefined) updateData.arrivalAirport = arrivalAirport.toUpperCase();
    if (date !== undefined) updateData.date = new Date(date).toISOString().split('T')[0];

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedFlight = await db
      .update(flights)
      .set(updateData)
      .where(eq(flights.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      flight: updatedFlight[0]
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      error: 'Failed to update flight',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } 
) {
  const id = Number(context.params.id); 

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flightToDelete = await db.select().from(flights).where(eq(flights.id, id));
    if (!flightToDelete.length || flightToDelete[0].userId !== userId) {
      return NextResponse.json({ error: 'Flight not found or unauthorized' }, { status: 404 });
    }

    const deletedFlight = await db.delete(flights).where(eq(flights.id, id)).returning();
    return NextResponse.json({
      success: true,
      deletedFlight: deletedFlight[0]
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      error: 'Failed to delete flight',
      details: error.message
    }, { status: 500 });
  }
}