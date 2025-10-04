// src/lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';
const TOKEN_EXPIRY = '7d';

export const generateAuthToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, companyId: user.companyId },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

// --- Server Middleware Helpers for API Routes ---

/**
 * Helper function to parse user data from a secured request.
 */
export const parseUserFromRequest = (request) => {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) return null;
        
        return jwt.verify(token, JWT_SECRET);

    } catch (error) {
        return null;
    }
}

/**
 * Middleware to restrict API access by role.
 */
export const withAuth = (handler, requiredRole = null) => {
  return async (request) => {
    const authUser = parseUserFromRequest(request);

    if (!authUser) {
      return new Response(JSON.stringify({ message: 'Authentication required.' }), { status: 401 });
    }

    // Admin has access to all restricted routes
    if (requiredRole && authUser.role !== requiredRole && authUser.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Authorization required.' }), { status: 403 });
    }

    // Attach user data to the request object for the handler to access
    // The handler can access the user data via request.user
    request.user = authUser;
    
    return handler(request);
  };
};

export const withAdminAuth = (handler) => withAuth(handler, 'admin');

/**
 * Middleware to restrict API access to Managers (and Admins).
 */
export const withManagerAuth = (handler) => withAuth(handler, 'manager');