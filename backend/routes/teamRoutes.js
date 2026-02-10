import express from 'express';
import {
  getAllTeams,
  getTeamByIdentifier,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMembers,
  removeTeamMember,
} from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', authenticate, getAllTeams);
router.post('/', authenticate, adminAuth, createTeam);
router.get('/:identifier', authenticate, getTeamByIdentifier);
router.put('/:identifier', authenticate, adminAuth, updateTeam);
router.delete('/:identifier', authenticate, adminAuth, deleteTeam);

router.get('/:identifier/members', authenticate, getTeamMembers);
router.post('/:identifier/members', authenticate, adminAuth, addTeamMembers);
router.delete('/:identifier/members/:userId', authenticate, adminAuth, removeTeamMember);

export default router;
