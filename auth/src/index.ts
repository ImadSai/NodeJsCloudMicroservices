import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/currentuser';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
const port = 3000;

// On averti que le serveur sera derriere un Proxy
app.set('trust proxy', true);

app.use(express.json());

// Use Cookie
app.use(
    cookieSession({
        signed: false, // On ne crypte pas le cookie vu qu'on utilisera JWT
        secure: true, // On utilise que en HTTPS

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

// Function that Start Server
function start(): void {

    // Check Env varibles
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY variable not present in the environment");
    }

    // Connect to MongoDB
    try {
        console.log('Connextion to DB..');
        mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to DB');
    } catch (err) {
        console.log(`Error : ${err}`);
    }

    // Error Handler
    app.use(errorHandler);

    // Publish service
    app.listen(port, () => {
        console.log(`Authentication Service:  listing on ${port}`);
    });
}

// Start the Server
start();

