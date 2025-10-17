import type { Request, Response } from 'express';
import PlanModel from '../models/plan.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const listPlans = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const plans = await PlanModel.find({ user: user.id }).sort({ scheduledOn: 1 });
  return res.json(plans);
};

export const createPlan = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const plan = await PlanModel.create({ ...req.body, user: user.id });
  return res.status(201).json(plan);
};

export const updatePlanStatus = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { id } = req.params;
  const { user: _ignoredUser, ...updates } = req.body;
  const plan = await PlanModel.findOneAndUpdate({ _id: id, user: user.id }, updates, {
    new: true,
    runValidators: true
  });
  if (!plan) {
    return res.status(404).json({ message: 'Plan not found' });
  }
  return res.json(plan);
};
