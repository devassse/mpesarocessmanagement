// Middleware for admin-only access
const requireAdmin = (req, res, next) => {
 
    if (!req.user.roles.some(role => role === 'Admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };
  
  // Middleware for admin or editor access
  const requireAdminOrEditor = (req, res, next) => {
    if (!req.user.roles.some(role => ['Admin', 'Editor'].includes(role))) {
      return res.status(403).json({ error: 'Admin or Editor access required' });
    }
    next();
  };
  
  // Middleware for admin or audit log access
  const requireAdminOrAuditLog = (req, res, next) => {
    if (!req.user.roles.some(role => ['Admin', 'Audit log'].includes(role))) {
      return res.status(403).json({ error: 'Admin or Audit Log access required' });
    }
    next();
  };
  
  // Middleware for all authenticated users
  const requireAuth = (req, res, next) => {
    // If we've reached this point, the user is authenticated
    next();
  };
  
  module.exports = {
    requireAdmin,
    requireAdminOrEditor,
    requireAdminOrAuditLog,
    requireAuth
  };