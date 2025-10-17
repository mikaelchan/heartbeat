import type { Request, Response } from 'express';
import MemoryModel from '../models/memory.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const listMemories = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const memories = await MemoryModel.find({ user: user.id }).sort({ happenedOn: -1 });
  return res.json(memories);
};

export const createMemory = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const memory = await MemoryModel.create({ ...req.body, user: user.id });
  return res.status(201).json(memory);
};
