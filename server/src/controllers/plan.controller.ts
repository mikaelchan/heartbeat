import type { Request, Response } from 'express';
import PlanModel from '../models/plan.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

export const listPlans = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const plans = await PlanModel.find({ relationship: relationship._id }).sort({ scheduledOn: 1 });
  return res.json(plans);
};

export const createPlan = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const plan = await PlanModel.create({ ...req.body, relationship: relationship._id });
  return res.status(201).json(plan);
};

export const updatePlanStatus = async (req: Request, res: Response) => {
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

  const plan = await PlanModel.findOneAndUpdate(
    { _id: id, relationship: relationship._id },
    updates,
    {
      new: true,
      runValidators: true
    }
  );
  if (!plan) {
    return res.status(404).json({ message: 'Plan not found' });
  }
  return res.json(plan);
};
