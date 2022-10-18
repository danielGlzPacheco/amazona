import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import productRouterpg from './routers/ProductRouterPg';
import { clientpg } from './DatabaseClientPg';
import uploadRouter from './routers/UploadRouter';
import userRouterpg from './routers/UserRouterPg';
import orderRouterPg from './routers/OrderRouterPg';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/producspg', productRouterpg);
app.use('/api/uploads', uploadRouter);
app.use('/api/userspg', userRouterpg);
app.use('/api/orderspg', orderRouterPg);

app.get('/', (_req, res) => {
  res.send('Server is ready');
});

app.get('/api/config/paypal', (_req, res) => {
  res.send(
    'AcsfN97e7wiL1NFwyNKYEWj9gab691vZgXzUU02OmtHGGm5QvmTVtULjxbmGUGXM42KDEq3Nd_-MPNA3'
  );
});

app.use((req, res, err) => {
  res.status(500).send({ error: err });
});

const PORT = 5000;
const HOST = '127.0.0.1';

async function startApp() {
  try {
    clientpg
      .connect()
      .then(() => {
        app.listen(PORT, HOST, () => {
          console.log(`Server running in: http://${HOST}:${PORT}`);
        });
      })
      .catch((err: any) => {
        console.error(err);
      });
  } catch (error) {
    console.log(error);
  }
}



startApp();
