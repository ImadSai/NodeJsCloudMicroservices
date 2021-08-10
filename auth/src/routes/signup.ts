import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { databaseConnectionError } from '../errors/database-connection-error';
import { User } from '../models/user';
import { BadRequestError } from '../errors/badRequestError';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * SignUp User
 */
router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be valid'),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    // Get email and password
    const { email, password } = req.body;

    // Check if the email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError("Email in use");
    }

    // Save the new user
    const user = User.build({ email, password });
    const savedUser = await user.save();

    // Generate the JWT 
    const userJwt = jwt.sign({
        id: savedUser.id,
        email: savedUser.email
    }, 'asdf');

    // Store it on session object
    req.session = {
        jwt: userJwt,
    };

    res.status(201).send(savedUser);
});

export { router as signupRouter };