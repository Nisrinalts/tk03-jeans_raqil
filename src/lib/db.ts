import { Pool } from "pg";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

export default pool;

// Lazy initialization — neon() hanya dipanggil saat query pertama, bukan saat build
let _sql: NeonQueryFunction<false, false> | null = null;

const getSql = (): NeonQueryFunction<false, false> => {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
};

export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      const fn = getSql();
      return (fn as unknown as (...a: unknown[]) => unknown)(...args);
    },
  }
);
