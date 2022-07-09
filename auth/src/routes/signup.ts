import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@isticketing/common';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * SignUp User
 */
router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be valid'),
], validateRequest, async (req: Request, res: Response) => {

    // Get email and password
    const { password } = req.body;

    const query = { email: req.body.email.toString() };

    // Check if the email exists
    const existingUser = await User.findOne(query);
    if (existingUser) {
        throw new BadRequestError("Email in use");
    }

    // Save the new user
    const user = User.build({ email, password });
    const savedUser = await user.save();

    // Get JWT_KEY
    const JWT_KEY = process.env.JWT_KEY;

    // Generate the JWT 
    const userJwt = jwt.sign({
        id: savedUser.id,
        email: savedUser.email
    }, JWT_KEY!);

    // Store it on session object
    req.session = {
        jwt: userJwt,
    };

    res.status(201).send(savedUser);
});

export { router as signupRouter };