import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

interface UploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

export const uploadImage = (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权访问，请先登录。' });
  }

  const { file } = req as UploadRequest;
  if (!file) {
    return res.status(400).json({ message: '请选择要上传的图片。' });
  }

  const url = `/uploads/${file.filename}`;

  return res.status(201).json({
    url,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  });
};
