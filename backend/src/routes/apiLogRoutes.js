import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { getAdminLogs, getAdminLogById } from '../controllers/apiLogController.js';

const router = express.Router();

router.get('/', authenticate, adminAuth, getAdminLogs);
router.get('/:id', authenticate, adminAuth, getAdminLogById);

export default router;
