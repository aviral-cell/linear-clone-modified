import express from 'express';
import {
  getIssuesByTeam,
  getIssueByIdentifier,
  createIssue,
  updateIssue,
  getMyIssues,
  getValidParents,
  toggleSubscribe,
} from '../controllers/issueController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-issues', authenticate, getMyIssues);
router.get('/team/:teamId', authenticate, getIssuesByTeam);
router.get('/:identifier/valid-parents', authenticate, getValidParents);
router.post('/:identifier/subscribe', authenticate, toggleSubscribe);
router.get('/:identifier', authenticate, getIssueByIdentifier);
router.post('/', authenticate, createIssue);
router.put('/:identifier', authenticate, updateIssue);

export default router;
