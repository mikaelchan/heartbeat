import { Router } from 'express';
import { login, register, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);

export default router;
