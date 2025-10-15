import type { Request, Response } from 'express';
import PlanModel from '../models/plan.js';

export const listPlans = async (_req: Request, res: Response) => {
  const plans = await PlanModel.find().sort({ scheduledOn: 1 });
  return res.json(plans);
};

export const createPlan = async (req: Request, res: Response) => {
  const plan = await PlanModel.create(req.body);
  return res.status(201).json(plan);
};

export const updatePlanStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await PlanModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!plan) {
    return res.status(404).json({ message: 'Plan not found' });
  }
  return res.json(plan);
};
