import express, { Router } from 'express';

const router = express.Router();

/**
 * SignIn User
 */
router.post('/api/users/signin', (req, res) => {
    res.send('Hi there : V2');
});

export { router as signinRouter };