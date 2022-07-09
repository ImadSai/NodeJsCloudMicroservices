import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/currentuser';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@isticketing/common';

const app = express();

// Disable powered by
app.disable("x-powered-by");

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

// Current User Router
app.use(currentUserRouter);

// SignIn Router
app.use(signinRouter);

// SignOut Router
app.use(signoutRouter);

// SignUp Router
app.use(signupRouter);

// Not found path
app.get('*', () => {
    throw new NotFoundError();
});

// Error Handler
app.use(errorHandler);

export { app };