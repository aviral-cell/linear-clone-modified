import { UnauthorizedError, ForbiddenError } from '../utils/AppError.js';

export const adminAuth = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  next();
};
