import type { Request, Response } from 'express';
import MemoryModel from '../models/memory.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

export const listMemories = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const memories = await MemoryModel.find({ relationship: relationship._id }).sort({ happenedOn: -1 });
  return res.json(memories);
};

export const createMemory = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const memory = await MemoryModel.create({ ...req.body, relationship: relationship._id });
  return res.status(201).json(memory);
};
