import type { Request, Response } from 'express';
import type { Prisma, Relationship as RelationshipModel } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

interface MilestoneInput {
  label?: string;
  date?: string | Date;
}

interface Milestone {
  label: string;
  date: string;
}

const mapRelationship = ({
  id,
  userOneId,
  userTwoId,
  coupleNames,
  milestones,
  ...rest
}: RelationshipModel) => {
  void userOneId;
  void userTwoId;
  return {
    ...rest,
    coupleNames: Array.isArray(coupleNames) ? (coupleNames as unknown as string[]) : [],
    milestones: Array.isArray(milestones) ? (milestones as unknown as Milestone[]) : [],
    _id: id
  };
};

const extractMilestones = (relationship: RelationshipModel): Milestone[] => {
  if (!Array.isArray(relationship.milestones)) {
    return [];
  }

  return (relationship.milestones as unknown as Milestone[]).map((milestone) => ({
    label: milestone.label,
    date: new Date(milestone.date).toISOString()
  }));
};

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const sanitizeMilestones = (milestones?: unknown): Milestone[] => {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones
    .map((milestone) => {
      const { label, date } = milestone as MilestoneInput;
      if (!label || !date) {
        return null;
      }
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return null;
      }
      return { label, date: parsedDate.toISOString() };
    })
    .filter((value): value is Milestone => value !== null);
};

export const getRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }]
    }
  });
  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }
  return res.json(mapRelationship(relationship));
};

export const getRelationshipSummary = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }]
    }
  });

  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const milestones = extractMilestones(relationship);

  return res.json({
    coupleNames: Array.isArray(relationship.coupleNames)
      ? (relationship.coupleNames as unknown as string[])
      : [],
    startedOn: relationship.startedOn.toISOString(),
    milestoneCount: milestones.length
  });
};

export const listRelationshipMilestones = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, 5);

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }]
    }
  });

  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const milestones = extractMilestones(relationship);
  const totalItems = milestones.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = milestones.slice(start, start + pageSize);

  return res.json({
    items,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages
  });
};

export const addRelationshipMilestone = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { label, date } = req.body as MilestoneInput;
  if (!label || !date) {
    return res.status(400).json({ message: '请填写完整的纪念信息。' });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: '请输入有效的时间。' });
  }

  const relationship = await prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }]
    }
  });

  if (!relationship) {
    return res.status(404).json({ message: 'Relationship not configured yet.' });
  }

  const milestones = extractMilestones(relationship);
  const newMilestone: Milestone = { label, date: parsedDate.toISOString() };
  const updatedMilestones = [...milestones, newMilestone].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  try {
    await prisma.relationship.update({
      where: { id: relationship.id },
      data: { milestones: updatedMilestones as unknown as Prisma.InputJsonValue }
    });
    return res.status(201).json(newMilestone);
  } catch (error) {
    console.error('Failed to create milestone', error);
    return res.status(500).json({ message: '创建纪念时出错，请稍后再试。' });
  }
};

export const upsertRelationship = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) {
    return res.status(401).json({ message: '未授权。' });
  }

  const { coupleNames, startedOn, milestones } = req.body as {
    coupleNames?: unknown;
    startedOn?: string | Date;
    milestones?: unknown;
  };

  const names = Array.isArray(coupleNames) ? coupleNames.filter((name): name is string => typeof name === 'string') : [];
  if (names.length === 0) {
    return res.status(400).json({ message: '请提供有效的昵称。' });
  }

  const startedOnDate = startedOn ? new Date(startedOn) : new Date();
  if (Number.isNaN(startedOnDate.getTime())) {
    return res.status(400).json({ message: '请输入有效的纪念日。' });
  }

  const sanitizedMilestones = sanitizeMilestones(milestones);

  const existing = await prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: user.id }, { userTwoId: user.id }]
    }
  });

  if (existing) {
    const updated = await prisma.relationship.update({
      where: { id: existing.id },
      data: {
        coupleNames: names,
        startedOn: startedOnDate,
        milestones: sanitizedMilestones as unknown as Prisma.InputJsonValue
      }
    });
    return res.json(mapRelationship(updated));
  }

  const created = await prisma.relationship.create({
    data: {
      userOneId: user.id,
      coupleNames: names,
      startedOn: startedOnDate,
      milestones: sanitizedMilestones as unknown as Prisma.InputJsonValue
    }
  });

  return res.json(mapRelationship(created));
};
