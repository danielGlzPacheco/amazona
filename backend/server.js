import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/ProductRouter.js';
import dotenv from 'dotenv';
import orderRouter from './routers/OderRouter.js';
import path from 'path';
import uploadRouter from './routers/uploadRouter.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', uploadRouter);

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (_req, res) => {
  res.send('Server is ready');
});

app.get('/api/config/paypal', (_req, res) => {
  res.send(
    'AcsfN97e7wiL1NFwyNKYEWj9gab691vZgXzUU02OmtHGGm5QvmTVtULjxbmGUGXM42KDEq3Nd_-MPNA3'
  );
  // res.send(proces.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use((err, req, res) => {
  res.status(500).send({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running in: http://localhost:' + PORT);
});
