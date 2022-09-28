import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { clientpg } from '../DatabaseClientPg.js';
import { isAdmin, isAuth } from '../utils.js';

const productRouterpg = express.Router();

productRouterpg.use(express.json());
productRouterpg.use(express.urlencoded({ extended: true }));

productRouterpg.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT json_agg(P) FROM public.products AS P '
      );
      res.status(200).json(result.rows[0][0]);
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

productRouterpg.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const createdProduct = {
      name: 'sample name ' + Date.now(),
      image: '/images/p1.jpg',
      price: 0,
      category: 'sample category',
      brand: 'sample brand',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'sample description',
    };

    try {
      const sqlquery =
        'INSERT INTO public.products' +
        '(name, image, brand, category, description, price, "countInStock", rating, "numReviews") ' +
        'VALUES (' +
        "'" +
        createdProduct.name +
        "', " +
        "'" +
        createdProduct.image +
        "', " +
        "'" +
        createdProduct.brand +
        "', " +
        "'" +
        createdProduct.category +
        "', " +
        "'" +
        createdProduct.description +
        "', " +
        createdProduct.price +
        ', ' +
        createdProduct.countInStock +
        ', ' +
        createdProduct.rating +
        ', ' +
        createdProduct.numReviews +
        ')';

      await clientpg.query(sqlquery);

      const result = await clientpg.query(
        "SELECT json_agg(P) FROM public.products AS P where P.name = '" +
          createdProduct.name +
          "'"
      );

      res.send({ message: 'Product Created', product: result.rows[0][0][0] });
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

productRouterpg.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT json_agg(P) FROM public.products AS P where P.id = $1',
        [req.params.id]
      );

      if (result.rows[0][0]) {
        res.status(200).json(result.rows[0][0][0]);
      } else {
        res.send('Product Not Found');
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

productRouterpg.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const sqlquery =
        'UPDATE public.products ' +
        "SET name='" +
        req.body.name +
        "', " +
        "image='" +
        req.body.image +
        "', " +
        "brand='" +
        req.body.brand +
        "', " +
        "category='" +
        req.body.category +
        "', " +
        "description='" +
        req.body.description +
        "', " +
        'price=' +
        req.body.price +
        ', ' +
        '"countInStock"=' +
        req.body.countInStock +
        ' WHERE id=' +
        req.params.id;

      await clientpg.query(sqlquery);

      res.send({ message: 'Product Updated' });
    } catch (error) {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouterpg.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      await clientpg.query(
        'DELETE FROM public.products WHERE id = ' + req.params.id
      );
      res.send({ message: 'Product deteled' });
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

export default productRouterpg;
