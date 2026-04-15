import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);
  const decoded = Buffer.from(token, 'base64').toString();
  const parts = decoded.split(':');

  if (parts.length !== 2) {
    res.status(401).json({ error: 'Invalid token format' });
    return;
  }

  (req as any).userId = parts[0];
  next();
}
