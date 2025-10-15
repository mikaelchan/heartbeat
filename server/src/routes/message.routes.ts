import { Router } from 'express';
import { createMessage, listMessages } from '../controllers/message.controller.js';

const router = Router();

router.get('/', listMessages);
router.post('/', createMessage);

export default router;
