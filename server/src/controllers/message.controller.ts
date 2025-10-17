import type { Request, Response } from 'express';
import type { Message as MessageModel } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

const mapMessage = ({ id, relationshipId: _relationshipId, ...rest }: MessageModel) => ({
  ...rest,
  _id: id
});

export const listMessages = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const messages = await prisma.message.findMany({
    where: { relationshipId: relationship.id },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(messages.map(mapMessage));
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

  const { author, content } = req.body as { author?: string; content?: string };
  if (!author || !content) {
    return res.status(400).json({ message: '请填写留言内容。' });
  }

  if (!['me', 'partner'].includes(author)) {
    return res.status(400).json({ message: '无效的留言作者。' });
  }

  try {
    const message = await prisma.message.create({
      data: {
        relationshipId: relationship.id,
        author,
        content
      }
    });
    return res.status(201).json(mapMessage(message));
  } catch (error) {
    console.error('Failed to create message', error);
    return res.status(500).json({ message: '创建留言时出错，请稍后再试。' });
  }
};
