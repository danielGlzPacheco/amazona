import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { generateToken, isAuth } from '../utils.js';
import { clientpg } from '../DatabaseClientPg.js';

const userRouterpg = express.Router();

userRouterpg.use(express.json());
userRouterpg.use(express.urlencoded({ extended: true }));

userRouterpg.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT json_agg(u) FROM public.users AS u where u.email = $1',
        [req.body.email]
      );

      if (result.rows[0][0]) {
        const user = result.rows[0][0][0];
        user.token = generateToken(user);

        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.status(200).json(user);
        } else {
          res.status(401).send({ message: 'Invalid email or password' });
        }
      } else {
        res.status(401).send({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

userRouterpg.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    try {
      var sqlquery =
        'INSERT INTO public.users' +
        '(name, email, password) ' +
        'VALUES (' +
        "'" +
        req.body.name +
        "', " +
        "'" +
        req.body.email +
        "', " +
        "'" +
        bcrypt.hashSync(req.body.password, 8) +
        "')";

      await clientpg.query(sqlquery);

      sqlquery =
        "SELECT json_agg(P) FROM public.users AS P where P.email = '" +
        req.body.email +
        "'";

      const result = await clientpg.query(sqlquery);

      var usuario = result.rows[0][0][0];
      usuario.token = generateToken(usuario);

      res.send(usuario);
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

userRouterpg.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT json_agg(P) FROM public.users AS P where P.id = ' +
          req.params.id
      );

      if (result.rows[0][0]) {
        res.status(200).json(result.rows[0][0][0]);
      } else {
        res.send('User Not Found');
      }
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

userRouterpg.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      var sqlquery =
        'UPDATE public.users ' +
        "SET name='" +
        req.body.name +
        "', " +
        "email='" +
        req.body.email +
        "'";

      if (req.body.password) {
        sqlquery += ".password='" + bcrypt.hashSync(req.body.password, 8);
      }

      sqlquery += ' WHERE id=' + req.body.userId;

      await clientpg.query(sqlquery);

      const result = await clientpg.query(
        'SELECT json_agg(u) FROM public.users AS u where u.email = $1',
        [req.body.email]
      );

      const user = result.rows[0][0][0];
      user.token = generateToken(user);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

export default userRouterpg;
