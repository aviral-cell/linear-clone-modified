import express from 'express';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/issue/:issueId', authenticate, getCommentsByIssue);
router.post('/issue/:issueId', authenticate, createComment);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
