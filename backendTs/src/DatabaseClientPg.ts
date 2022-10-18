
// import { Client } from 'pg';
import pkg from 'pg';
const { Client } = pkg;


export const clientpg = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'masterkey',
  port: 5432,
});
