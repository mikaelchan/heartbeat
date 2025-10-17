import type { Request, Response } from 'express';
import RelationshipModel from '../models/relationship.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await RelationshipModel.findOne({ user: user.id });
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }
  return res.json(relationship);
};

export const upsertRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { coupleNames, startedOn, milestones } = req.body;
  const relationship = await RelationshipModel.findOneAndUpdate(
    { user: user.id },
    { user: user.id, coupleNames, startedOn, milestones },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return res.json(relationship);
};
