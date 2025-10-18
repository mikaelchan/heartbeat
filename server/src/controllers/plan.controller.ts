import type { Request, Response } from 'express';
import type { Plan as PlanModel, Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { findRelationshipForUser } from '../utils/relationship.js';

const mapPlan = ({ id, relationshipId, ...rest }: PlanModel) => {
  void relationshipId;
  return {
    ...rest,
    _id: id
  };
};

export const listPlans = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const plans = await prisma.plan.findMany({
    where: { relationshipId: relationship.id },
    orderBy: { scheduledOn: 'asc' }
  });
  return res.json(plans.map(mapPlan));
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

  const { title, description, scheduledOn, attachments, status } = req.body as {
    title?: string;
    description?: string;
    scheduledOn?: string | Date;
    attachments?: unknown;
    status?: string;
  };

  if (!title || !description || !scheduledOn) {
    return res.status(400).json({ message: '请完善计划信息。' });
  }

  const scheduledOnDate = new Date(scheduledOn);
  if (Number.isNaN(scheduledOnDate.getTime())) {
    return res.status(400).json({ message: '请输入有效的时间。' });
  }

  try {
    const plan = await prisma.plan.create({
      data: {
        relationshipId: relationship.id,
        title,
        description,
        scheduledOn: scheduledOnDate,
        attachments: Array.isArray(attachments) ? attachments : [],
        status: status ?? 'upcoming'
      }
    });
    return res.status(201).json(mapPlan(plan));
  } catch (error) {
    console.error('Failed to create plan', error);
    return res.status(500).json({ message: '创建计划时出错，请稍后再试。' });
  }
};

export const updatePlanStatus = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { id } = req.params;
  const relationship = await findRelationshipForUser(user.id);
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing || existing.relationshipId !== relationship.id) {
    return res.status(404).json({ message: 'Plan not found' });
  }

  const { title, description, status, scheduledOn, attachments } = req.body as {
    title?: string;
    description?: string;
    status?: string;
    scheduledOn?: string | Date;
    attachments?: unknown;
  };

  const data: Prisma.PlanUpdateInput = {};
  if (typeof title === 'string') {
    data.title = title;
  }
  if (typeof description === 'string') {
    data.description = description;
  }
  if (typeof status === 'string') {
    data.status = status;
  }
  if (scheduledOn) {
    const scheduledDate = new Date(scheduledOn);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: '请输入有效的时间。' });
    }
    data.scheduledOn = scheduledDate;
  }
  if (Array.isArray(attachments)) {
    data.attachments = attachments;
  }

  if (Object.keys(data).length === 0) {
    return res.json(mapPlan(existing));
  }

  try {
    const plan = await prisma.plan.update({ where: { id }, data });
    return res.json(mapPlan(plan));
  } catch (error) {
    console.error('Failed to update plan', error);
    return res.status(500).json({ message: '更新计划时出错，请稍后再试。' });
  }
};
