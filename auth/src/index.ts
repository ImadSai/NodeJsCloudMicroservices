import { loggerHelper } from '@isticketing/common';
import mongoose from 'mongoose';
import { app } from './app';

// Port Used
const port = 3000;

// Application name
const applicationName = "ticketing";

// Service name
const serviceName = "AuthenticationService";

// JWT Key
const jwtKey = process.env.JWT_KEY;

// Database URL
const databaseURI = process.env.MONGO_URI;

// Logstash URL
const logstashUrl = process.env.LOGSTASH_URL

// Declare a global Functions
declare global {
    var logger: any;
}

// Function that Start Server
const start = async () => {

    // Check Env varibles
    if (!jwtKey) {
        throw new Error("JWT_KEY variable not present in the environment");
    }

    if (!databaseURI) {
        throw new Error("MONGO_URI variable not present in the environment");
    }

    if (!logstashUrl) {
        throw new Error("LOGSTASH_URL variable not present in the environment");
    }

    // Init logger
    await loggerHelper.init({
        logstashAddress: logstashUrl,
        applicationName: applicationName,
        serviceName: serviceName
    });
    global.logger = loggerHelper.logger;

    // Connect to MongoDB
    try {
        logger.debug(`${serviceName} - Connection to DB..`);
        await mongoose.connect(databaseURI);
        logger.debug(`${serviceName} - Connected to DB`);
    } catch (err) {
        logger.error(`${serviceName} - Error : ${err}`);
    }

    // Publish service
    app.listen(port, () => {
        logger.info(`${serviceName} - listing on port : ${port}`);
    });
};

// Start the Server
start();