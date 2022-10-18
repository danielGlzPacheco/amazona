import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { generateToken, isAuth } from '../utils';
import { clientpg } from '../DatabaseClientPg';

const userRouterpg = express.Router();
userRouterpg.use(express.json());
userRouterpg.use(express.urlencoded({ extended: true }));

userRouterpg.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(
        'SELECT * FROM public.users where email = $1 LIMIT 1',
        [req.body.email]
      );

      if (result.rows[0]) {
        let user: any = result.rows[0];
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
        "') RETURNING id";

      const resultInsert = await clientpg.query(sqlquery);
      let idUSer = resultInsert.rows[0].id;

      sqlquery = `SELECT * FROM public.users where id = ${idUSer} LIMIT 1`;
      const result = await clientpg.query(sqlquery);  
    
      let user: any = result.rows[0];
      user.token = generateToken(user);

      res.status(200).json(user);
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

userRouterpg.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    try {
      const result = await clientpg.query(`SELECT * FROM public.users where id = ${req.params.id} LIMIT 1`);

      if (result.rows[0]) {
        let user: any = result.rows[0];
        user.token = generateToken(user);
        res.status(200).json(user);
      } else {
        res.status(401).send('User not found');
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
        "' ";

      if (req.body.password) {
        sqlquery += ", password='" + bcrypt.hashSync(req.body.password, 8) + "'";
      }
      sqlquery += ' WHERE id=' + req.body.userId;

      await clientpg.query(sqlquery);
      
      const result = await clientpg.query(`SELECT * FROM public.users where id = ${req.body.userId} LIMIT 1`);

      let user: any = result.rows[0];
      user.token = generateToken(user);
      res.status(200).json(user);

    } catch (error) {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouterpg;
