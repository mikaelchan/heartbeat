import type { Request, Response } from 'express';
import RelationshipModel from '../models/relationship.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await RelationshipModel.findOne({
    $or: [{ userOne: user.id }, { userTwo: user.id }]
  });
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
    { $or: [{ userOne: user.id }, { userTwo: user.id }] },
    {
      $set: { coupleNames, startedOn, milestones },
      $setOnInsert: { userOne: user.id }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return res.json(relationship);
};
