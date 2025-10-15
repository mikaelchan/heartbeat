import type { Request, Response } from 'express';
import BucketItemModel from '../models/bucket-item.js';

export const listBucketItems = async (_req: Request, res: Response) => {
  const items = await BucketItemModel.find().sort({ order: 1 });
  return res.json(items);
};

export const createBucketItem = async (req: Request, res: Response) => {
  const item = await BucketItemModel.create(req.body);
  return res.status(201).json(item);
};

export const updateBucketItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await BucketItemModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!item) {
    return res.status(404).json({ message: 'Bucket item not found' });
  }
  return res.json(item);
};
