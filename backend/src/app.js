import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import apiLogRoutes from './routes/apiLogRoutes.js';
import { apiLogger } from './middleware/apiLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(apiLogger);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin/logs', apiLogRoutes);

app.use(errorHandler);

export default app;
