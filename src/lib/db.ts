import { Pool } from "pg";
import { neon } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

export default pool;

export const sql = neon(process.env.DATABASE_URL!);
