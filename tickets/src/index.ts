import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

// Port Used
const port = 3000;

// Service name
const serviceName = "Tickets Service";

// JWT Key
const jwtKey = process.env.JWT_KEY;

// Database URL
const databaseURI = process.env.MONGO_URI;

// Function that Start Server
const start = async () => {

    // Check Env varibles
    if (!jwtKey) {
        throw new Error("JWT_KEY variable not present in the environment");
    }

    if (!databaseURI) {
        throw new Error("MONGO_URI variable not present in the environment");
    }

    // Connect to MongoDB and Nats
    try {

        await natsWrapper.connect(serviceName, 'ticketing', 'client1234', 'http://nats-srv:4222');

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        console.log(`${serviceName} - Connextion to DB..`);
        await mongoose.connect(databaseURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log(`${serviceName} - Connected to DB`);
    } catch (err) {
        console.log(`${serviceName} - Error : ${err}`);
    }

    // Publish service
    app.listen(port, () => {
        console.log(`${serviceName} - listing on port : ${port}`);
    });
};

// Start the Server
start();