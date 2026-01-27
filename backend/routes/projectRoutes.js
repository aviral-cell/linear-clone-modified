import express from 'express';
import {
  listProjects,
  createProject,
  getProjectByIdentifier,
  updateProject,
  getProjectIssues,
  getProjectUpdates,
  createProjectUpdate,
  getProjectActivities,
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
router.get('/:identifier/activities', authenticate, getProjectActivities);

export default router;


