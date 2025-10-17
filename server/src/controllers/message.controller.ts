import type { Request, Response } from 'express';
import MessageModel from '../models/message.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const listMessages = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const messages = await MessageModel.find({ user: user.id }).sort({ createdAt: -1 });
  return res.json(messages);
};

export const createMessage = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const message = await MessageModel.create({
    user: user.id,
    author: req.body.author,
    content: req.body.content
  });
  return res.status(201).json(message);
};
