import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@isticketing/common';
import { createOrdersRouter } from './routes/new';
import { indexOrdersRouter } from './routes/index';
import { deleteOrdersRouter } from './routes/delete';
import { showOrdersRouter } from './routes/show';

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

// Set current User
app.use(currentUser);

// Router Get all Orders
app.use(indexOrdersRouter);

// Router Get all Orders
app.use(createOrdersRouter);

// Route create Orders
app.use(deleteOrdersRouter);

// Router show Orders
app.use(showOrdersRouter);

// Not found path
app.get('*', () => {
    throw new NotFoundError();
});

// Error Handler
app.use(errorHandler);

export { app };
