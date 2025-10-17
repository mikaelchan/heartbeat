import type { Request, Response } from 'express';
import BucketItemModel from '../models/bucket-item.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const listBucketItems = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const items = await BucketItemModel.find({ user: user.id }).sort({ order: 1 });
  return res.json(items);
};

export const createBucketItem = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const item = await BucketItemModel.create({ ...req.body, user: user.id });
  return res.status(201).json(item);
};

export const updateBucketItem = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { id } = req.params;
  const { user: _ignoredUser, ...updates } = req.body;
  const item = await BucketItemModel.findOneAndUpdate({ _id: id, user: user.id }, updates, {
    new: true,
    runValidators: true
  });
  if (!item) {
    return res.status(404).json({ message: 'Bucket item not found' });
  }
  return res.json(item);
};
