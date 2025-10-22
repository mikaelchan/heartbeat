import { Router } from 'express';
import {
  addRelationshipMilestone,
  getRelationship,
  getRelationshipSummary,
  listRelationshipMilestones,
  upsertRelationship
} from '../controllers/relationship.controller.js';

const router = Router();

router.get('/summary', getRelationshipSummary);
router.get('/milestones', listRelationshipMilestones);
router.post('/milestones', addRelationshipMilestone);
router.get('/', getRelationship);
router.put('/', upsertRelationship);

export default router;
