import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export interface AuthTokenPayload {
  id: string;
  username: string;
  gender: 'male' | 'female' | 'other';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权访问，请先登录。' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: '登录状态已失效，请重新登录。' });
  }
};
