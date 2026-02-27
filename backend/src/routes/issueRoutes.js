import express from 'express';
import {
  getMyIssues,
  getIssues,
  createIssue,
  getIssueByIdentifier,
  updateIssue,
  deleteIssue,
  getValidParents,
  getIssueActivities,
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/issueController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-issues', authenticate, getMyIssues);
router.get('/', authenticate, getIssues);
router.post('/', authenticate, createIssue);
router.get('/:identifier', authenticate, getIssueByIdentifier);
router.put('/:identifier', authenticate, updateIssue);
router.delete('/:identifier', authenticate, deleteIssue);
router.get('/:identifier/valid-parents', authenticate, getValidParents);
router.get('/:identifier/activities', authenticate, getIssueActivities);
router.get('/:identifier/comments', authenticate, getCommentsByIssue);
router.post('/:identifier/comments', authenticate, createComment);
router.put('/:identifier/comments/:id', authenticate, updateComment);
router.delete('/:identifier/comments/:id', authenticate, deleteComment);

export default router;
