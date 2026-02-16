import express from 'express';
import {
  getIssues,
  getIssueByIdentifier,
  createIssue,
  updateIssue,
  getMyIssues,
  getValidParents,
  toggleSubscribe,
} from '../controllers/issueController.js';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { getIssueActivities } from '../controllers/issueActivityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-issues', authenticate, getMyIssues);
router.get('/', authenticate, getIssues);
router.get('/:identifier/valid-parents', authenticate, getValidParents);
router.get('/:identifier/comments', authenticate, getCommentsByIssue);
router.get('/:identifier/activities', authenticate, getIssueActivities);
router.post('/:identifier/subscribe', authenticate, toggleSubscribe);
router.post('/:identifier/comments', authenticate, createComment);
router.put('/:identifier/comments/:id', authenticate, updateComment);
router.delete('/:identifier/comments/:id', authenticate, deleteComment);
router.get('/:identifier', authenticate, getIssueByIdentifier);
router.post('/', authenticate, createIssue);
router.put('/:identifier', authenticate, updateIssue);

export default router;
