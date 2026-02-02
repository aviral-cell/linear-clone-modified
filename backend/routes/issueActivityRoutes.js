import express from 'express';
import { getIssueActivities } from '../controllers/issueActivityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/issue/:issueId', authenticate, getIssueActivities);

export default router;
