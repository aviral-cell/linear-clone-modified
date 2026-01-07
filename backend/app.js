import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';

import connectDatabase from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

const PORT = process.env.PORT || 8080;
const app = express();

dotenv.config();

connectDatabase().catch((err) => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Flow Backend API is running successfully!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Flow Backend server is running on port: ${PORT}`);
});

export default app;
