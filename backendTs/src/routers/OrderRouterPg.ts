import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth } from '../utils';
import { format } from 'date-fns';
import { clientpg } from '../DatabaseClientPg';

const orderRouterPg = express.Router();
orderRouterPg.use(express.json());
orderRouterPg.use(express.urlencoded({ extended: true }));

orderRouterPg.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req: any, res: any) => {
    try {
      if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'Cart is empty' });
      } else {
        let infoOrder: any = req.body;

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
        const order_id = result.rows[0].order_id;

        infoOrder.cartItems.forEach((cartItem: any) => {
          sqlquery = `INSERT INTO public."orderItems"(order_id, product_id, qty, price) VALUES (${order_id}, ${cartItem.product}, ${cartItem.qty}, ${cartItem.price})`;
          clientpg.query(sqlquery);
        });

        infoOrder.order_id = order_id;

        res
          .status(200)
          .send({ message: 'New Order Created', order: infoOrder });
      }
    } catch (error: any) {
      res.status(404).send({ message: error.message });
    }
  })
);

orderRouterPg.get(
  '/id/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      let result = await clientpg.query(
        'SELECT * FROM public."order" WHERE order_id = ' +
          req.params.id
      );

      if (result.rows[0]) {
        let order: any = result.rows;
        let orderResult: any = {}; 

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

        const OrderItemsQry = await clientpg.query(
          'SELECT P.name, P.image, P.price ' +
          'FROM public."orderItems" AS O ' +
          'LEFT JOIN public."products" AS P ' +
            'on O.product_id = P.id ' +
            'WHERE O.order_id = ' +
            req.params.id
        );
        
        let resOrderItems: any = OrderItemsQry.rows;

        orderResult.orderItems = resOrderItems;

        res.status(200).json(orderResult);
      } else {
      //   res.status(404).send({ message: 'Order Not Found' });
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
        'SELECT * FROM public."order" WHERE order_id = ' +
          req.params.id
      );

      if (result.rows[0]) {
        let order: any = result.rows[0];

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
  expressAsyncHandler(async (req: any, res: any) => {
    try {
      var result = await clientpg.query(
        'SELECT * FROM public."order" WHERE usuario_id = ' +
          req.user.id
      );

      if (result.rows[0]) {
        let orders: any = result.rows;
        res.status(200).json(orders);
      } else {
        res.status(404).send({ message: 'Orders not found' });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

export default orderRouterPg;
