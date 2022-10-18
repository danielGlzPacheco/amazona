import { Client } from 'ts-postgres';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

export const clientpg = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'masterkey',
  port: 5432,
});
