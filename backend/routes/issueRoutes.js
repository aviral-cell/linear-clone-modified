import express from 'express';
import {
  getIssuesByTeam,
  getIssueByIdentifier,
  createIssue,
  updateIssue,
} from '../controllers/issueController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/team/:teamId', authenticate, getIssuesByTeam);
router.get('/:identifier', authenticate, getIssueByIdentifier);
router.post('/', authenticate, createIssue);
router.put('/:identifier', authenticate, updateIssue);

export default router;
