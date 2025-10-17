import type { Request, Response } from 'express';
import BucketItemModel from '../models/bucket-item.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

export const listBucketItems = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const items = await BucketItemModel.find({ relationship: relationship._id }).sort({ order: 1 });
  return res.json(items);
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

  const item = await BucketItemModel.create({ ...req.body, relationship: relationship._id });
  return res.status(201).json(item);
};

export const updateBucketItem = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.relationship;
  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const item = await BucketItemModel.findOneAndUpdate(
    { _id: id, relationship: relationship._id },
    updates,
    {
      new: true,
      runValidators: true
    }
  );
  if (!item) {
    return res.status(404).json({ message: 'Bucket item not found' });
  }
  return res.json(item);
};
