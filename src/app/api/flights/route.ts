// src/app/api/flights/route.ts
import { db } from '@/db';
import { flights } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('User ID:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testQuery = await db.select().from(flights).limit(1);
    console.log('Test query result:', testQuery);

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
  
      const body = await request.json();
      const { flightNumber, date } = body;
  
      // TODO:
      // 1. Call flight lookup API to get flight details
      // 2. Post flight data in db
  
      return NextResponse.json({ success: true });
    } catch (err) {
      const error = err as Error;
      return NextResponse.json({ 
        error: 'Internal Server Error',
        details: error.message 
      }, { status: 500 });
    }
  }