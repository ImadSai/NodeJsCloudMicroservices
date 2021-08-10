import express, { Router } from 'express';
import { NotFoundError } from '../errors/not-found-error';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
    throw new NotFoundError();
});

export { router as currentUserRouter };