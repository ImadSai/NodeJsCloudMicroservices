import express, { Router } from 'express';

const router = express.Router();

/**
 * SignOut User
 */
router.post('/api/users/signout', (req, res) => {
    res.send('Hi there : V2');
});

export { router as signoutRouter };