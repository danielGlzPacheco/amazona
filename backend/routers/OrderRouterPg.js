import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils.js';
import { format } from 'date-fns';
import { clientpg } from '../DatabaseClientPg.js';

const orderRouterPg = express.Router();
orderRouterPg.use(express.json());
orderRouterPg.use(express.urlencoded({ extended: true }));

orderRouterPg.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'Cart is empty' });
      } else {
        const infoOrder = req.body;

        var sqlquery =
          'INSERT INTO public."order"(' +
          'usuario_id, "fullName", address, city, postalcode, country, "paymentMethod", "isPaid", "isDelivered", "shippingPrice", "taxPrice", "itemsPrice", "date")' +
          `VALUES (${req.user.id}, '${infoOrder.shippingAddress.fullName}', '${
            infoOrder.shippingAddress.address
          }', '${infoOrder.shippingAddress.city}', '${
            infoOrder.shippingAddress.postalCode
          }', '${infoOrder.shippingAddress.country}', '${
            infoOrder.paymentMethod
          }', ${false}, ${false}, ${infoOrder.shippingPrice}, ${
            infoOrder.taxPrice
          }, ${infoOrder.itemsPrice}, '${format(
            new Date(),
            'yyyy/MM/dd'
          )}' ) RETURNING order_id`;

        const result = await clientpg.query(sqlquery);
        const order_id = result.rows[0][0];

        infoOrder.cartItems.forEach((cartItem) => {
          sqlquery = `INSERT INTO public."orderItems"(order_id, product_id, qty, price) VALUES (${order_id}, ${cartItem.product}, ${cartItem.qty}, ${cartItem.price})`;
          clientpg.query(sqlquery);
        });

        infoOrder.order_id = order_id;

        res
          .status(200)
          .send({ message: 'New Order Created', order: infoOrder });
      }
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  })
);

orderRouterPg.get(
  '/id/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT json_agg(O) FROM public."order" AS O WHERE order_id = ' +
          req.params.id
      );

      var order = result.rows[0][0];

      if (order) {
        order = order[0];

        var orderResult = {};
        orderResult.order_id = order.order_id;
        orderResult.shippingAddress = {};
        orderResult.shippingAddress.fullName = order.fullName;
        orderResult.shippingAddress.address = order.address;
        orderResult.shippingAddress.city = order.city;
        orderResult.shippingAddress.postalCode = order.postalCode;
        orderResult.shippingAddress.country = order.country;

        orderResult.paymentMethod = order.paymentMethod;
        orderResult.shippingPrice = order.shippingPrice;
        orderResult.taxPrice = order.taxPrice;
        orderResult.isPaid = order.isPaid;
        orderResult.paidAt = order.paidAt;

        orderResult.itemsPrice = order.itemsPrice;
        orderResult.totalPrice = orderResult.itemsPrice + orderResult.taxPrice;

        const result = await clientpg.query(
          'SELECT json_agg((o, p)) ' +
            'FROM public."orderItems" as o ' +
            'LEFT JOIN public."products" as p ' +
            'on o.product_id = p.id ' +
            'WHERE O.order_id = ' +
            req.params.id
        );
        var resOrderItems = result.rows[0][0];

        var orderItemsVal = [];
        var cont = 0;
        resOrderItems.forEach((orderItem) => {
          var item = orderItem.f1;
          item.name = orderItem.f2.name;
          item.image = orderItem.f2.image;

          orderItemsVal[cont++] = item;
        });

        orderResult.orderItems = orderItemsVal;

        res.status(200).json(orderResult);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

orderRouterPg.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      var result = await clientpg.query(
        'SELECT json_agg(O) FROM public."order" AS O WHERE order_id = ' +
          req.params.id
      );

      var order = result.rows[0][0];

      if (order) {
        order = order[0];

        var sqlquery = `UPDATE public."order" SET "isPaid"=${true}, "paidAt"='${format(
          new Date(),
          'yyyy/MM/dd'
        )}' WHERE order_id=${order.order_id} `;

        result = await clientpg.query(sqlquery);
        res.status(200).json('Order paid');
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

orderRouterPg.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      var result = await clientpg.query(
        'SELECT json_agg(O) FROM public."order" AS O WHERE usuario_id = ' +
          req.user.id
      );

      var orders = result.rows[0][0];

      if (orders) {
        res.status(200).json(orders);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

export default orderRouterPg;
