import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { Client } from 'ts-postgres';

const productRouterpg = express.Router();

productRouterpg.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const client = new Client({
      user: 'postgres',
      host: 'amazona.c4vurfvhjghf.us-east-1.rds.amazonaws.com',
      database: 'amazona',
      password: 'masterkey',
      port: 5432,
    });

    await client.connect();

    try {
      // Querying the client returns a query result promise
      // which is also an asynchronous result iterator.
      const result = await client.execute('select * from products');
      console.log(result);
      console.log('after print result');

      for await (const row of result) {
        // 'Hello world!'
        console.log(row.get('message'));
      }
      res.send(result);
    } finally {
      await client.end();
    }
  })
);

export default productRouterpg;
