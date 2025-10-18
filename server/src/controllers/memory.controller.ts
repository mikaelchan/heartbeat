import type { Request, Response } from 'express';
import type { Memory as MemoryModel, Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

const mapMemory = ({ id, relationshipId, ...rest }: MemoryModel) => {
  void relationshipId;
  return {
    ...rest,
    _id: id
  };
};

export const listMemories = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const memories = await prisma.memory.findMany({
    where: { relationshipId: relationship.id },
    orderBy: { happenedOn: 'desc' }
  });
  return res.json(memories.map(mapMemory));
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

  const { title, description, photoUrl, location, happenedOn } = req.body as {
    title?: string;
    description?: string;
    photoUrl?: string;
    location?: unknown;
    happenedOn?: string | Date;
  };

  if (!title || !description || !photoUrl || !location || !happenedOn) {
    return res.status(400).json({ message: '请完整填写回忆信息。' });
  }

  const happenedOnDate = new Date(happenedOn);
  if (Number.isNaN(happenedOnDate.getTime())) {
    return res.status(400).json({ message: '请输入有效的时间。' });
  }

  try {
    const memory = await prisma.memory.create({
      data: {
        relationshipId: relationship.id,
        title,
        description,
        photoUrl,
        location: location as Prisma.InputJsonValue,
        happenedOn: happenedOnDate
      }
    });
    return res.status(201).json(mapMemory(memory));
  } catch (error) {
    console.error('Failed to create memory', error);
    return res.status(500).json({ message: '创建回忆时出错，请稍后再试。' });
  }
};
