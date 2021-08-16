import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Defining User Payload
interface UserPayload {
    id: string;
    email: string;
}

// Redefine Request - Add currentUser Field
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.session?.jwt) {
        return next();
    }

    // Get JWT_KEY
    const JWT_KEY = process.env.JWT_KEY;

    try {
        const payload = jwt.verify(req.session.jwt, JWT_KEY!) as UserPayload;
        req.currentUser = payload;
    } catch (err) { }

    next();
};