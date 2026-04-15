import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

const users: Map<string, User> = new Map();

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existing = Array.from(users.values()).find(u => u.email === email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const user: User = {
    id: uuidv4(),
    email,
    password, // store password directly
    name: name || '',
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user || user.password !== password) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Return a simple token
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = Buffer.from(token, 'base64').toString();
  const userId = decoded.split(':')[0];

  const user = users.get(userId);
  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
