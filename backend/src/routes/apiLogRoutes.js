import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAdminLogs, getAdminLogById } from '../controllers/apiLogController.js';

const router = express.Router();

router.get('/', authenticate, getAdminLogs);
router.get('/:id', authenticate, getAdminLogById);

export default router;
