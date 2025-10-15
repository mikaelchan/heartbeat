import { Router } from 'express';
import { createPlan, listPlans, updatePlanStatus } from '../controllers/plan.controller.js';

const router = Router();

router.get('/', listPlans);
router.post('/', createPlan);
router.patch('/:id', updatePlanStatus);

export default router;
