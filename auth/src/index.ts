import mongoose from 'mongoose';
import { app } from './app';

// Port Used
const port = 3000;

// Function that Start Server
const start = async () => {

    // Check Env varibles
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY variable not present in the environment");
    }

    // Connect to MongoDB
    try {
        console.log('Connextion to DB..');
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to DB');
    } catch (err) {
        console.log(`Error : ${err}`);
    }

    // Publish service
    app.listen(port, () => {
        console.log(`Authentication Service:  listing on ${port}`);
    });
};

// Start the Server
start();