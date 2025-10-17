import { Router } from 'express';
import relationshipRoutes from './relationship.routes.js';
import memoryRoutes from './memory.routes.js';
import planRoutes from './plan.routes.js';
import bucketRoutes from './bucket.routes.js';
import messageRoutes from './message.routes.js';
import authRoutes from './auth.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(authenticate);
router.use('/relationship', relationshipRoutes);
router.use('/memories', memoryRoutes);
router.use('/plans', planRoutes);
router.use('/bucket', bucketRoutes);
router.use('/messages', messageRoutes);

export default router;
