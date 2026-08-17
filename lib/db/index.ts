import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "";

const sql = connectionString.startsWith("postgres") ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// In-memory mock DB fallback store for offline / dev demo testing if database connection is pending
export interface MockStore {
  uploadedResumes: any[];
  generatedResumes: any[];
}

export const inMemoryStore: MockStore = {
  uploadedResumes: [],
  generatedResumes: [],
};
