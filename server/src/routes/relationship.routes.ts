import { Router } from 'express';
import {
  getRelationship,
  getRelationshipSummary,
  listRelationshipMilestones,
  upsertRelationship
} from '../controllers/relationship.controller.js';

const router = Router();

router.get('/summary', getRelationshipSummary);
router.get('/milestones', listRelationshipMilestones);
router.get('/', getRelationship);
router.put('/', upsertRelationship);

export default router;
