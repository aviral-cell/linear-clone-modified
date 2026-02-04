import express from 'express';
import { authenticate } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import {
  getAdminLogs,
  getAdminLogById,
  getAdminLogStats,
  cleanupOldLogs,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication + admin authorization
router.get('/logs', authenticate, adminAuth, getAdminLogs);
router.get('/logs/stats', authenticate, adminAuth, getAdminLogStats);
router.get('/logs/:id', authenticate, adminAuth, getAdminLogById);
router.delete('/logs/cleanup', authenticate, adminAuth, cleanupOldLogs);

export default router;
