import type { Request, Response } from 'express';
import MemoryModel from '../models/memory.js';

export const listMemories = async (_req: Request, res: Response) => {
  const memories = await MemoryModel.find().sort({ happenedOn: -1 });
  return res.json(memories);
};

export const createMemory = async (req: Request, res: Response) => {
  const memory = await MemoryModel.create(req.body);
  return res.status(201).json(memory);
};
