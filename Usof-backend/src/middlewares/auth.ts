import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const TokenBlacklist: Set<string> = new Set();

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    if (TokenBlacklist.has(token)) {
        res.status(403).json({ error: 'Token has been blacklisted' });
        return;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
        return;
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
};