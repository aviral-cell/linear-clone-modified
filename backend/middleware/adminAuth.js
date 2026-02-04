/**
 * Admin Authorization Middleware
 * Restricts access to admin-only endpoints
 * Must be used after the authenticate middleware
 */
const adminAuth = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: 'Admin access required. You do not have permission to access this resource.',
    });
  }

  next();
};

export default adminAuth;
