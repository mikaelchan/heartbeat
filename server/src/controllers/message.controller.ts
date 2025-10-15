import type { Request, Response } from 'express';
import MessageModel from '../models/message.js';

export const listMessages = async (_req: Request, res: Response) => {
  const messages = await MessageModel.find().sort({ createdAt: -1 });
  return res.json(messages);
};

export const createMessage = async (req: Request, res: Response) => {
  const message = await MessageModel.create({
    author: req.body.author,
    content: req.body.content
  });
  return res.status(201).json(message);
};
