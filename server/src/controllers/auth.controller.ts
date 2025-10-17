import type { Request, Response } from 'express';
import type { Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import env from '../config/env.js';
import prisma from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

const SALT_ROUNDS = 10;

type Gender = 'male' | 'female' | 'other';

interface SerializedUser {
  id: string;
  username: string;
  gender: Gender;
  partnerId: string | null;
  pairingCode: string | null;
  relationshipConfirmedAt: string | null;
}

const createToken = (user: SerializedUser) => {
  const secret = env.jwtSecret as Secret;
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ id: user.id, username: user.username, gender: user.gender }, secret, options);
};

const buildPartnerPlaceholder = (gender: Gender) => {
  switch (gender) {
    case 'male':
      return '她';
    case 'female':
      return '他';
    default:
      return 'Ta';
  }
};

const seedDefaultData = async (
  user: User,
  options: { partnerName?: string; startedOn: Date },
  tx: Prisma.TransactionClient
) => {
  const partnerName = options.partnerName ?? buildPartnerPlaceholder((user.gender as Gender) ?? 'other');
  const relationship = await tx.relationship.create({
    data: {
      userOneId: user.id,
      userTwoId: null,
      coupleNames: [user.username, partnerName],
      startedOn: options.startedOn,
      milestones: [
        { label: `${user.username} 与 ${partnerName} 的第一次牵手`, date: new Date('2021-07-03T00:00:00.000Z').toISOString() },
        { label: '第一次旅行', date: new Date('2022-05-20T00:00:00.000Z').toISOString() },
        { label: '我们的小家', date: new Date('2023-09-09T00:00:00.000Z').toISOString() }
      ]
    }
  });

  await tx.memory.createMany({
    data: [
      {
        relationshipId: relationship.id,
        title: '日落海边的约定',
        description: `${user.username} 和 ${partnerName} 一起看海的日落，偷偷约定每年都要来一次。`,
        photoUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
        location: { lat: 22.5431, lng: 114.0579, placeName: '深圳·大梅沙' },
        happenedOn: new Date('2022-10-02T10:00:00.000Z')
      },
      {
        relationshipId: relationship.id,
        title: '雪中的拥抱',
        description: `${user.username} 把 ${partnerName} 揽在怀里，看漫天雪花。`,
        photoUrl:
          'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
        location: { lat: 41.8057, lng: 123.4315, placeName: '沈阳·棋盘山' },
        happenedOn: new Date('2023-01-15T08:00:00.000Z')
      }
    ]
  });

  await tx.plan.createMany({
    data: [
      {
        relationshipId: relationship.id,
        title: '一起去看极光',
        description: `${user.username} 想牵着 ${partnerName} 在极光下跳舞。`,
        scheduledOn: new Date('2024-12-15T18:00:00.000Z'),
        attachments: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80'
        ],
        status: 'upcoming'
      },
      {
        relationshipId: relationship.id,
        title: '拍一组情侣写真',
        description: `${user.username} 想把这一年的故事做成一本相册送给 ${partnerName}。`,
        scheduledOn: new Date('2024-05-20T09:00:00.000Z'),
        attachments: [],
        status: 'in-progress'
      }
    ]
  });

  await tx.bucketItem.createMany({
    data: Array.from({ length: 12 }, (_, index) => ({
      relationshipId: relationship.id,
      position: index + 1,
      title: `${user.username} 和 ${partnerName} 的第 ${index + 1} 件小事`,
      completed: index < 3
    }))
  });

  await tx.message.createMany({
    data: [
      {
        relationshipId: relationship.id,
        author: 'me',
        content: `${user.username} 记录下今天的心动瞬间，期待与 ${partnerName} 的明天。`
      },
      {
        relationshipId: relationship.id,
        author: 'partner',
        content: `${partnerName} 对 ${user.username} 说：谢谢你一直把我放在心上。`
      }
    ]
  });
};

const generatePairingCode = async (): Promise<string> => {
  let code: string;
  do {
    code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  } while (await prisma.user.findUnique({ where: { pairingCode: code } }));
  return code;
};

const serializeUser = (user: User): SerializedUser => ({
  id: user.id,
  username: user.username,
  gender: (user.gender as Gender) ?? 'other',
  partnerId: user.partnerId ?? null,
  pairingCode: user.pairingCode ?? null,
  relationshipConfirmedAt: user.relationshipConfirmedAt
    ? user.relationshipConfirmedAt.toISOString()
    : null
});

type PairingMode = 'create' | 'join';

interface RegisterRequestBody {
  username?: string;
  password?: string;
  gender?: Gender;
  pairingMode?: PairingMode;
  pairCode?: string;
  relationshipConfirmedAt?: string;
}

export const register = async (req: Request, res: Response) => {
  const { username, password, gender, pairingMode, pairCode, relationshipConfirmedAt } =
    req.body as RegisterRequestBody;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空。' });
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return res.status(400).json({ message: '用户名不能为空。' });
  }

  if (pairingMode !== 'create' && pairingMode !== 'join') {
    return res.status(400).json({ message: '请选择有效的配对方式。' });
  }

  const sanitizedPairCode = pairCode?.trim();

  if (pairingMode === 'join' && (!sanitizedPairCode || !/^[0-9]{6}$/.test(sanitizedPairCode))) {
    return res.status(400).json({ message: '请输入有效的 6 位配对码。' });
  }

  const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (existing) {
    return res.status(409).json({ message: '该用户名已被使用。' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const startDateFromBody = relationshipConfirmedAt ? new Date(relationshipConfirmedAt) : new Date();
  const isStartDateValid = !Number.isNaN(startDateFromBody.getTime());

  let partner: User | null = null;
  let relationshipStart = new Date();
  let pairingCodeToAssign: string | null = null;

  if (pairingMode === 'create') {
    if (relationshipConfirmedAt && !isStartDateValid) {
      return res.status(400).json({ message: '请选择有效的关系确认时间。' });
    }
    relationshipStart = isStartDateValid ? startDateFromBody : new Date();
    pairingCodeToAssign = await generatePairingCode();
  } else {
    partner = await prisma.user.findUnique({ where: { pairingCode: sanitizedPairCode } });
    if (!partner) {
      return res.status(404).json({ message: '未找到对应的配对码，请确认后再试。' });
    }
    if (partner.partnerId) {
      return res.status(409).json({ message: '该配对码已被使用。' });
    }
    relationshipStart = partner.relationshipConfirmedAt ?? new Date();
  }

  try {
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: normalizedUsername,
          passwordHash,
          gender: gender ?? 'other',
          partnerId: partner ? partner.id : null,
          pairingCode: pairingCodeToAssign,
          relationshipConfirmedAt: relationshipStart
        }
      });

      if (!partner) {
        await seedDefaultData(user, { startedOn: relationshipStart }, tx);
      } else {
        await tx.user.update({
          where: { id: partner.id },
          data: {
            partnerId: user.id,
            pairingCode: null,
            relationshipConfirmedAt: relationshipStart
          }
        });

        await tx.relationship.updateMany({
          where: { OR: [{ userOneId: partner.id }, { userTwoId: partner.id }] },
          data: {
            userTwoId: user.id,
            coupleNames: [partner.username, user.username],
            startedOn: relationshipStart
          }
        });
      }

      return user;
    });

    const serialized = serializeUser(createdUser);
    const token = createToken(serialized);
    return res.status(201).json({ token, user: serialized });
  } catch (error) {
    console.error('Failed to register user', error);
    return res.status(500).json({ message: '初始化默认数据时出错，请稍后再试。' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码。' });
  }

  const user = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误。' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: '用户名或密码错误。' });
  }

  const serialized = serializeUser(user);
  const token = createToken(serialized);
  return res.json({ token, user: serialized });
};

export const getProfile = async (req: Request, res: Response) => {
  const { user: authUser } = req as AuthenticatedRequest;
  if (!authUser) {
    return res.status(401).json({ message: '未授权。' });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) {
    return res.status(404).json({ message: '用户不存在。' });
  }

  return res.json(serializeUser(user));
};
