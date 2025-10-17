import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel, { type UserDocument } from '../models/user.js';
import env from '../config/env.js';
import RelationshipModel from '../models/relationship.js';
import MemoryModel from '../models/memory.js';
import PlanModel from '../models/plan.js';
import BucketItemModel from '../models/bucket-item.js';
import MessageModel from '../models/message.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

const SALT_ROUNDS = 10;

type Gender = UserDocument['gender'];

const createToken = (user: UserDocument) => {
  const secret = env.jwtSecret as Secret;
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ id: user._id.toString(), username: user.username, gender: user.gender }, secret, options);
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
  user: UserDocument,
  options: { partnerName?: string; startedOn: Date },
  session: mongoose.ClientSession
) => {
  const partnerName = options.partnerName ?? buildPartnerPlaceholder(user.gender);
  await RelationshipModel.create(
    [
      {
        user: user._id,
        coupleNames: [user.username, partnerName],
        startedOn: options.startedOn,
        milestones: [
          { label: `${user.username} 与 ${partnerName} 的第一次牵手`, date: new Date('2021-07-03T00:00:00.000Z') },
          { label: '第一次旅行', date: new Date('2022-05-20T00:00:00.000Z') },
          { label: '我们的小家', date: new Date('2023-09-09T00:00:00.000Z') }
        ]
      }
    ],
    { session }
  );

  await MemoryModel.insertMany(
    [
      {
        user: user._id,
        title: '日落海边的约定',
        description: `${user.username} 和 ${partnerName} 一起看海的日落，偷偷约定每年都要来一次。`,
        photoUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      location: { lat: 22.5431, lng: 114.0579, placeName: '深圳·大梅沙' },
      happenedOn: new Date('2022-10-02T10:00:00.000Z')
    },
    {
      user: user._id,
      title: '雪中的拥抱',
      description: `${user.username} 把 ${partnerName} 揽在怀里，看漫天雪花。`,
      photoUrl:
        'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
      location: { lat: 41.8057, lng: 123.4315, placeName: '沈阳·棋盘山' },
      happenedOn: new Date('2023-01-15T08:00:00.000Z')
    }
    ],
    { session }
  );

  await PlanModel.insertMany(
    [
      {
        user: user._id,
        title: '一起去看极光',
        description: `${user.username} 想牵着 ${partnerName} 在极光下跳舞。`,
        scheduledOn: new Date('2024-12-15T18:00:00.000Z'),
      attachments: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80'
      ],
      status: 'upcoming'
    },
    {
      user: user._id,
      title: '拍一组情侣写真',
      description: `${user.username} 想把这一年的故事做成一本相册送给 ${partnerName}。`,
      scheduledOn: new Date('2024-05-20T09:00:00.000Z'),
      attachments: [],
      status: 'in-progress'
    }
    ],
    { session }
  );

  await BucketItemModel.insertMany(
    Array.from({ length: 12 }, (_, index) => ({
      user: user._id,
      order: index + 1,
      title: `${user.username} 和 ${partnerName} 的第 ${index + 1} 件小事`,
      completed: index < 3
    })),
    { session }
  );

  await MessageModel.insertMany(
    [
      {
        user: user._id,
        author: 'me',
        content: `${user.username} 记录下今天的心动瞬间，期待与 ${partnerName} 的明天。`
    },
    {
      user: user._id,
      author: 'partner',
      content: `${partnerName} 对 ${user.username} 说：谢谢你一直把我放在心上。`
    }
    ],
    { session }
  );
};

const generatePairingCode = async (): Promise<string> => {
  let code: string;
  do {
    code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  } while (await UserModel.exists({ pairingCode: code }));
  return code;
};

const serializeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  username: user.username,
  gender: user.gender,
  partnerId: user.partner ? user.partner.toString() : null,
  pairingCode: user.pairingCode ?? null,
  relationshipConfirmedAt: user.relationshipConfirmedAt ? user.relationshipConfirmedAt.toISOString() : null
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

  const existing = await UserModel.findOne({ username: normalizedUsername });
  if (existing) {
    return res.status(409).json({ message: '该用户名已被使用。' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const startDateFromBody = relationshipConfirmedAt ? new Date(relationshipConfirmedAt) : new Date();
  const isStartDateValid = !Number.isNaN(startDateFromBody.getTime());

  let partner: UserDocument | null = null;
  let relationshipStart = new Date();
  let pairingCodeToAssign: string | null = null;
  let partnerNameForSeed: string | undefined;

  if (pairingMode === 'create') {
    if (relationshipConfirmedAt && !isStartDateValid) {
      return res.status(400).json({ message: '请选择有效的关系确认时间。' });
    }
    relationshipStart = isStartDateValid ? startDateFromBody : new Date();
    pairingCodeToAssign = await generatePairingCode();
  } else {
    partner = await UserModel.findOne({ pairingCode: sanitizedPairCode });
    if (!partner) {
      return res.status(404).json({ message: '未找到对应的配对码，请确认后再试。' });
    }
    if (partner.partner) {
      return res.status(409).json({ message: '该配对码已被使用。' });
    }
    relationshipStart = partner.relationshipConfirmedAt ?? new Date();
    partnerNameForSeed = partner.username;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const createdUsers = await UserModel.create(
      [
        {
          username: normalizedUsername,
          passwordHash,
          gender: gender ?? 'other',
          partner: partner ? partner._id : null,
          pairingCode: pairingCodeToAssign,
          relationshipConfirmedAt: relationshipStart
        }
      ],
      { session }
    );

    const user = createdUsers[0];

    await seedDefaultData(user, { startedOn: relationshipStart, partnerName: partnerNameForSeed }, session);

    if (partner) {
      partner.partner = user._id;
      partner.pairingCode = null;
      partner.relationshipConfirmedAt = relationshipStart;
      await partner.save({ session });

      await RelationshipModel.updateOne(
        { user: partner._id },
        {
          $set: {
            coupleNames: [partner.username, user.username],
            startedOn: relationshipStart
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    const token = createToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: '初始化默认数据时出错，请稍后再试。' });
  } finally {
    session.endSession();
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码。' });
  }

  const user = await UserModel.findOne({ username: username.trim() });
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误。' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: '用户名或密码错误。' });
  }

  const token = createToken(user);
  return res.json({ token, user: serializeUser(user) });
};

export const getProfile = async (req: Request, res: Response) => {
  const { user: authUser } = req as AuthenticatedRequest;
  if (!authUser) {
    return res.status(401).json({ message: '未授权。' });
  }

  const user = await UserModel.findById(authUser.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在。' });
  }

  return res.json(serializeUser(user));
};
