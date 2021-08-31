import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@isticketing/common';
import { newPaymentRouter } from './routes/new';

const app = express();

// On averti que le serveur sera derriere un Proxy
app.set('trust proxy', true);

app.use(express.json());

// Use Cookie
app.use(
    cookieSession({
        signed: false, // On ne crypte pas le cookie vu qu'on utilisera JWT
        secure: process.env.NODE_ENV !== 'test', // On utilise que HTTPS
    })
);

// Set the current user
app.use(currentUser);

// Router new payment
app.use(newPaymentRouter);

// Not found path
app.get('*', () => {
    throw new NotFoundError();
});

// Error Handler
app.use(errorHandler);

export { app };