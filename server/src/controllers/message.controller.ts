import type { Request, Response } from 'express';
import MessageModel from '../models/message.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

export const listMessages = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const messages = await MessageModel.find({ relationship: relationship._id }).sort({ createdAt: -1 });
  return res.json(messages);
};

export const createMessage = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const message = await MessageModel.create({
    relationship: relationship._id,
    author: req.body.author,
    content: req.body.content
  });
  return res.status(201).json(message);
};
