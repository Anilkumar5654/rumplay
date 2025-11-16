import { createPool, Pool } from "mysql2/promise";

let pool: Pool | null = null;

const resolveConfig = () => {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const portValue = process.env.DB_PORT;
  if (!host || !user || !password || !database) {
    throw new Error("Database configuration incomplete");
  }
  const port = portValue ? Number(portValue) : 3306;
  if (Number.isNaN(port)) {
    throw new Error("Database port must be a number");
  }
  return { host, user, password, database, port, connectionLimit: 10, namedPlaceholders: true }; 
};

export const getPool = (): Pool => {
  if (!pool) {
    const config = resolveConfig();
    pool = createPool(config);
  }
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
