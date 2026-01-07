import express from 'express';
import { getActivitiesByIssue } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/issue/:issueId', authenticate, getActivitiesByIssue);

export default router;
