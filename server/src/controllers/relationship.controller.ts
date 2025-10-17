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
  userOneId: _userOneId,
  userTwoId: _userTwoId,
  coupleNames,
  milestones,
  ...rest
}: RelationshipModel) => ({
  ...rest,
  coupleNames: Array.isArray(coupleNames) ? (coupleNames as unknown as string[]) : [],
  milestones: Array.isArray(milestones) ? (milestones as unknown as Milestone[]) : [],
  _id: id
});

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
