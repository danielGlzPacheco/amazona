import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { unwatchFile } from 'fs';
import { clientpg } from '../DatabaseClientPg';
import { isAdmin, isAuth } from '../utils';

const productRouterpg = express.Router();

productRouterpg.use(express.json());
productRouterpg.use(express.urlencoded({ extended: true }));

productRouterpg.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query('SELECT * FROM public.products');
      
      let products: any = result.rows;


      res.status(200).json(products);
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
        ') RETURNING id';

      const resultInsert = await clientpg.query(sqlquery);
      let idProduct = resultInsert.rows[0].id;

      const result = await clientpg.query(`SELECT * FROM public.products where id = ${idProduct}`);
      let product: any = result.rows[0];

      res.status(200).json({ message: 'Product Created', product: product});
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

productRouterpg.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(`SELECT * FROM public.products where id = ${req.params.id}`);
      
      if (result.rows[0]) {
        let product: any = result.rows[0];
        res.status(200).json(product);
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

      const result = await clientpg.query(`SELECT * FROM public.products where id = ${req.params.id}`);      
      let product: any = result.rows[0];
      
      res.status(200).json({ message: 'Product Updated', product: product});
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
