import type { Request, Response } from 'express';
import RelationshipModel from '../models/relationship.js';

export const getRelationship = async (_req: Request, res: Response) => {
  const relationship = await RelationshipModel.findOne();
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }
  return res.json(relationship);
};

export const upsertRelationship = async (req: Request, res: Response) => {
  const { coupleNames, startedOn, milestones } = req.body;
  const relationship = await RelationshipModel.findOneAndUpdate(
    {},
    { coupleNames, startedOn, milestones },
    { upsert: true, new: true, runValidators: true }
  );
  return res.json(relationship);
};
