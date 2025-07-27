import { Request, Response, NextFunction } from 'express';
import { UserManager } from '../services/UserManager';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
        email: string;
    };
}

export function createAuthMiddleware(userManager: UserManager) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.sessionId;

        if (!sessionId) {
            return res.status(401).json({ error: 'Token de acesso necessário' });
        }

        const session = userManager.validateSession(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Sessão inválida ou expirada' });
        }

        req.user = {
            userId: session.userId,
            username: session.username,
            email: session.email
        };

        next();
    };
}