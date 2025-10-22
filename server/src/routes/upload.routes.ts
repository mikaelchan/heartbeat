import { Router } from 'express';
import { imageUpload } from '../config/uploads.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

const singleImageUpload = imageUpload.single('image');

router.post('/images', (req, res, next) => {
  singleImageUpload(req, res, (error) => {
    if (error) {
      const message = error instanceof Error ? error.message : '上传图片失败，请稍后再试。';
      return res.status(400).json({ message });
    }
    next();
  });
}, uploadImage);

export default router;
