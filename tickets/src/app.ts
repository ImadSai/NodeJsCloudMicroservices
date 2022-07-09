import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotFoundError } from '@isticketing/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

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

// Set current User
app.use(currentUser);

// Route create Ticket
app.use(createTicketRouter);

// Router show Ticket
app.use(showTicketRouter);

// Router Get all tickets
app.use(indexTicketRouter);

// Router Update ticket
app.use(updateTicketRouter);

// Not found path
app.get('*', () => {
    throw new NotFoundError();
});

// Error Handler
app.use(errorHandler);

export { app };