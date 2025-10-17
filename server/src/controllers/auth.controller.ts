import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
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

const buildPartnerName = (gender: Gender) => {
  switch (gender) {
    case 'male':
      return '她';
    case 'female':
      return '他';
    default:
      return 'Ta';
  }
};

const seedDefaultData = async (user: UserDocument) => {
  const partnerName = buildPartnerName(user.gender);
  await RelationshipModel.create({
    user: user._id,
    coupleNames: [user.username, partnerName],
    startedOn: new Date('2021-06-01T00:00:00.000Z'),
    milestones: [
      { label: `${user.username} 与 ${partnerName} 的第一次牵手`, date: new Date('2021-07-03T00:00:00.000Z') },
      { label: '第一次旅行', date: new Date('2022-05-20T00:00:00.000Z') },
      { label: '我们的小家', date: new Date('2023-09-09T00:00:00.000Z') }
    ]
  });

  await MemoryModel.insertMany([
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
  ]);

  await PlanModel.insertMany([
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
  ]);

  await BucketItemModel.insertMany(
    Array.from({ length: 12 }, (_, index) => ({
      user: user._id,
      order: index + 1,
      title: `${user.username} 和 ${partnerName} 的第 ${index + 1} 件小事`,
      completed: index < 3
    }))
  );

  await MessageModel.insertMany([
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
  ]);
};

export const register = async (req: Request, res: Response) => {
  const { username, password, gender } = req.body as {
    username?: string;
    password?: string;
    gender?: Gender;
  };

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空。' });
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return res.status(400).json({ message: '用户名不能为空。' });
  }

  const existing = await UserModel.findOne({ username: normalizedUsername });
  if (existing) {
    return res.status(409).json({ message: '该用户名已被使用。' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({
    username: normalizedUsername,
    passwordHash,
    gender: gender ?? 'other'
  });

  try {
    await seedDefaultData(user);
  } catch (error) {
    await UserModel.findByIdAndDelete(user._id);
    return res.status(500).json({ message: '初始化默认数据时出错，请稍后再试。' });
  }

  const token = createToken(user);
  return res.status(201).json({
    token,
    user: { id: user._id.toString(), username: user.username, gender: user.gender }
  });
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
  return res.json({ token, user: { id: user._id.toString(), username: user.username, gender: user.gender } });
};

export const getProfile = async (req: Request, res: Response) => {
  const { user: authUser } = req as AuthenticatedRequest;
  if (!authUser) {
    return res.status(401).json({ message: '未授权。' });
  }

  const user = await UserModel.findById(authUser.id).lean();
  if (!user) {
    return res.status(404).json({ message: '用户不存在。' });
  }

  return res.json({ id: user._id.toString(), username: user.username, gender: user.gender });
};
