import { Router } from 'express';
import { getRelationship, upsertRelationship } from '../controllers/relationship.controller.js';

const router = Router();

router.get('/', getRelationship);
router.put('/', upsertRelationship);

export default router;
