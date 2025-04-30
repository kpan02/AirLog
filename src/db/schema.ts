import { pgTable, serial, timestamp, text, varchar, integer, date, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Flight Table
export const flights = pgTable('flights', {
  id: serial('id').primaryKey(),
  // User ID from Clerk
  userId: varchar('user_id', { length: 256 }).notNull(),
  flightNumber: varchar('flight_number', { length: 10 }).notNull(),
  airline: varchar('airline', { length: 100 }).notNull(),
  
  // Departure details
  departureAirport: varchar('departure_airport', { length: 4 }).notNull(), // IATA code
  departureCity: varchar('departure_city', { length: 100 }).notNull(),
  departureCountry: varchar('departure_country', { length: 100 }).notNull(),
  departureTime: timestamp('departure_time').notNull(),
  
  // Arrival details
  arrivalAirport: varchar('arrival_airport', { length: 4 }).notNull(), // IATA code
  arrivalCity: varchar('arrival_city', { length: 100 }).notNull(),
  arrivalCountry: varchar('arrival_country', { length: 100 }).notNull(),
  arrivalTime: timestamp('arrival_time').notNull(),
  
  // Flight statistics
  distance: real('distance').notNull(), // in miles
  duration: integer('duration').notNull(), // in minutes
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});