import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import uploadRouter from './routers/UploadRouter.js';
import productRouterpg from './routers/ProductRouterPg.js';
import { clientpg } from './DatabaseClientPg.js';
import userRouterpg from './routers/UserRouterPg.js';
import orderRouterPg from './routers/OrderRouterPg.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/uploads', uploadRouter);

app.get('/', (_req, res) => {
  res.send('Server is ready');
});

app.get('/api/config/paypal', (_req, res) => {
  res.send(
    'AcsfN97e7wiL1NFwyNKYEWj9gab691vZgXzUU02OmtHGGm5QvmTVtULjxbmGUGXM42KDEq3Nd_-MPNA3'
  );
});

app.use('/api/producspg', productRouterpg);
app.use('/api/userspg', userRouterpg);
app.use('/api/orderspg', orderRouterPg);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use((req, res, err) => {
  res.status(500).send({ message: err.message });
});

const PORT = 5000;
const HOST = '0.0.0.0';

const startApp = async () => {
  try {
    clientpg
      .connect()
      .then(() => {
        app.listen(PORT, HOST, () => {
          console.log(`Server running in: http://${HOST}:${PORT}`);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.log(error);
  }
};
startApp();
