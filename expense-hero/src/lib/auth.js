// JWT/Session verification functions
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      companyId: user.companyId 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function extractTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function authenticateRequest(request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    throw new Error('No token provided');
  }
  
  return verifyToken(token);
}

export function requireRole(userToken, requiredRole) {
  if (userToken.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }
}