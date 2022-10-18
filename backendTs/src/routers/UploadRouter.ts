import multer from 'multer';
import express from 'express';
import { isAuth } from '../utils';

const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination(req: any, file: any, cb: any) {
    cb(null, 'uploads/');
  },
  filename(req: any, file: any, cb: any) {
    cb(null, `${Date.now()}.jpg`);
  },
});

const upload = multer({ storage });

uploadRouter.post('/', isAuth, upload.single('image'), (req: any, res: any) => {
  res.send(`/${req.file.path}`);
});

export default uploadRouter;
