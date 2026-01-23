import express from 'express';
import {
  listProjects,
  createProject,
  getProjectByIdentifier,
  updateProject,
  getProjectIssues,
  getProjectUpdates,
  createProjectUpdate,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, listProjects);
router.post('/', authenticate, createProject);
router.get('/:identifier', authenticate, getProjectByIdentifier);
router.put('/:identifier', authenticate, updateProject);
router.get('/:identifier/issues', authenticate, getProjectIssues);
router.get('/:identifier/updates', authenticate, getProjectUpdates);
router.post('/:identifier/updates', authenticate, createProjectUpdate);

export default router;


