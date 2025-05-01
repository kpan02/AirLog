// src/db/schema.ts

import { pgTable, serial, timestamp, varchar, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Flight Table
export const flights = pgTable('flights', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),

  // Flight details
  flightNumber: varchar('flight_number', { length: 10 }).notNull(),
  date: date('date').notNull(),
  departureAirport: varchar('departure_airport', { length: 4 }).notNull(), // IATA code: e.g., LAX, JFK
  arrivalAirport: varchar('arrival_airport', { length: 4 }).notNull(), // IATA code 

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});