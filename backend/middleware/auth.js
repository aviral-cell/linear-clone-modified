import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError } from '../utils/appError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'workflow-secret-key-change-in-production';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    var decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  req.user = user;
  next();
};
