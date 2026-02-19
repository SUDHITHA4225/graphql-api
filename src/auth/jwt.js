import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId, username, role) {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader) {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * Get user from context
 */
export function getUser(context) {
  return context.user || null;
}

/**
 * Require authentication - throws error if user not authenticated
 */
export function requireAuth(context) {
  if (!context.user) {
    throw new Error('Not authenticated');
  }
  return context.user;
}

/**
 * Require admin role - throws error if user is not admin
 */
export function requireAdmin(context) {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new Error('Not authorized - admin access required');
  }
  return user;
}
