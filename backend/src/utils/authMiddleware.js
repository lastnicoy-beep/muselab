import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: decoded.sub, role: decoded.role, name: decoded.name };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function roles(allowed) {
  return (req, res, next) => {
    const role = req.user?.role || 'VIEWER';
    if (!allowed.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}


