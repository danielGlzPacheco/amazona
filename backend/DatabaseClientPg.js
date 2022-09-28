import { Client } from 'ts-postgres';

export const clientpg = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'masterkey',
  port: process.env.PGPORT || 5432,
});
