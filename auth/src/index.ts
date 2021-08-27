import mongoose from 'mongoose';
import { app } from './app';

// Port Used
const port = 3000;

// Service name
const serviceName = "Authentication Service";

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

    // Connect to MongoDB
    try {
        console.log(`${serviceName} - Connextion to DB..`);
        await mongoose.connect(databaseURI);
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