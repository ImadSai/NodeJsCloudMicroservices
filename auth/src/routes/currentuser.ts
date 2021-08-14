import express, { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const pass = "express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall4TVRkaVkySmxPVEl5TldNNE1EQXhZbUkyWmpCak5DSXNJbVZ0WVdsc0lqb2lhVzFoWkRFeU0wQm9iM1J0WVdsc0xtWnlJaXdpYVdGMElqb3hOakk0T1RRMk1qa3pmUS5XN1E3Xzc2cW1mazlwcVhBR3A1VnhYNTBnQ1Bld21oeW5wZG5mSHAwU1U4In0=;";

router.get('/api/users/currentuser', (req, res) => {

    // Verify if token exists in cookies
    if (!req.session || !req.session.jwt) {
        return res.send({ currentUser: null });
    }

    // Get JWT_KEY
    const JWT_KEY = process.env.JWT_KEY;

    // Verify Token
    try {
        const payload = jwt.verify(req.session.jwt, JWT_KEY!);
        res.status(200).send(payload);
    } catch (_) {
        res.send({ currentUser: null });
    }
});

export { router as currentUserRouter };
