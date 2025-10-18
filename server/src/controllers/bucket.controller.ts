import type { Request, Response } from 'express';
import type { BucketItem as BucketItemModel, Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

const mapBucketItem = ({ id, relationshipId, position, ...rest }: BucketItemModel) => {
  void relationshipId;
  return {
    ...rest,
    order: position,
    _id: id
  };
};

export const listBucketItems = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const items = await prisma.bucketItem.findMany({
    where: { relationshipId: relationship.id },
    orderBy: { position: 'asc' }
  });
  return res.json(items.map(mapBucketItem));
};

export const createBucketItem = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const body = req.body as { order?: number; title?: string; completed?: boolean };
  if (!body.title) {
    return res.status(400).json({ message: '标题不能为空。' });
  }

  const nextPosition =
    typeof body.order === 'number'
      ? body.order
      : (await prisma.bucketItem.count({ where: { relationshipId: relationship.id } })) + 1;

  try {
    const item = await prisma.bucketItem.create({
      data: {
        relationshipId: relationship.id,
        position: nextPosition,
        title: body.title,
        completed: body.completed ?? false
      }
    });
    return res.status(201).json(mapBucketItem(item));
  } catch (error) {
    console.error('Failed to create bucket item', error);
    return res.status(500).json({ message: '创建清单项时出错，请稍后再试。' });
  }
};

export const updateBucketItem = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { id } = req.params;
  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const existing = await prisma.bucketItem.findUnique({ where: { id } });
  if (!existing || existing.relationshipId !== relationship.id) {
    return res.status(404).json({ message: 'Bucket item not found' });
  }

  const { order, title, completed } = req.body as {
    order?: number;
    title?: string;
    completed?: boolean;
  };

  const data: Prisma.BucketItemUpdateInput = {};
  if (typeof order === 'number') {
    data.position = order;
  }
  if (typeof title === 'string') {
    data.title = title;
  }
  if (typeof completed === 'boolean') {
    data.completed = completed;
  }

  if (Object.keys(data).length === 0) {
    return res.json(mapBucketItem(existing));
  }

  try {
    const item = await prisma.bucketItem.update({ where: { id }, data });
    return res.json(mapBucketItem(item));
  } catch (error) {
    console.error('Failed to update bucket item', error);
    return res.status(500).json({ message: '更新清单项时出错，请稍后再试。' });
  }
};
