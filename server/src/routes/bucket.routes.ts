import { Router } from 'express';
import { createBucketItem, listBucketItems, updateBucketItem } from '../controllers/bucket.controller.js';

const router = Router();

router.get('/', listBucketItems);
router.post('/', createBucketItem);
router.patch('/:id', updateBucketItem);

export default router;
