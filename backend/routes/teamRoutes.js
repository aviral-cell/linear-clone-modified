import express from 'express';
import { getAllTeams, getTeamByIdentifier, getTeamMembers } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllTeams);
router.get('/:identifier', authenticate, getTeamByIdentifier);
router.get('/:identifier/members', authenticate, getTeamMembers);

export default router;
