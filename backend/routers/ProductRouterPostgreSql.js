import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import * as pg from 'pg';

const { Pool } = pg.default;

const clientPg = new Pool({
  user: 'postgres',
  host: 'amazona.c4vurfvhjghf.us-east-1.rds.amazonaws.com',
  database: 'amazona',
  password: 'masterkey',
  port: 5432,
});

const productRouterpg = express.Router();

productRouterpg.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    await clientPg.query('SELECT * FROM PRODUCTS', (err, respg) => {
      if (err) {
        console.error(err);
        res.status(404).send({ message: 'connection error: ' + err.message });
      } else {
        console.log(respg);
        respg.end();
        res.send(respg);
      }
    });
  })
);

export default productRouterpg;
