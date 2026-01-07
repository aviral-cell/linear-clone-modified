import express from 'express';
import { getAllTeams } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAllTeams);

export default router;
