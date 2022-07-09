import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@isticketing/common';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * SignIn User
 */
router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('You must suppy a password'),
], validateRequest, async (req: Request, res: Response) => {

    // Get password
    const { password } = req.body;

    const query = { email: req.body.email.toString() };

    // Check if the email exists
    const existingUser = await User.findOne(query);
    if (!existingUser) {
        throw new BadRequestError("Bad Email/Password");
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
        throw new BadRequestError("Bad Email/Password");
    }

    // Get JWT_KEY
    const JWT_KEY = process.env.JWT_KEY;

    // Generate the JWT 
    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, JWT_KEY!);

    // Store it on session object
    req.session = {
        jwt: userJwt,
    };

    res.status(200).send(existingUser);
});

export { router as signinRouter };