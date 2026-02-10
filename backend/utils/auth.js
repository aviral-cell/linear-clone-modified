import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'workflow-secret-key-change-in-production';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
