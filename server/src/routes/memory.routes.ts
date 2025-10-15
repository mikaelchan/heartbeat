import { Router } from 'express';
import { createMemory, listMemories } from '../controllers/memory.controller.js';

const router = Router();

router.get('/', listMemories);
router.post('/', createMemory);

export default router;
