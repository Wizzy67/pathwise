import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pathwise-super-secret-key-123!';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'pathwise-admin-secret-key-123!';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // We try to verify as either student or admin. We'll use the generic secret for students.
    // If it fails, maybe it's an admin token? We should ideally know the role, but let's check both.
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    }
    
    req.user = decoded; // { id, role, ... }
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const verifyAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid admin token.' });
  }
};

export const generateToken = (payload, isAdmin = false) => {
  const secret = isAdmin ? ADMIN_JWT_SECRET : JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: isAdmin ? '2h' : '7d' });
};
