import express from 'express';
import { authenticate } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
  getAdminLogs,
  getAdminLogById,
  getAdminLogStats,
} from '../controllers/apiLogController.js';

const router = express.Router();

router.get('/logs', authenticate, adminAuth, getAdminLogs);
router.get('/logs/:id', authenticate, adminAuth, getAdminLogById);
router.get('/logs/stats', authenticate, adminAuth, getAdminLogStats);

export default router;
