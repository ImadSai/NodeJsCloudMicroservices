import { loggerHelper } from '@isticketing/common';
import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

// Port Used
const port = 3000;

// Service name
const serviceName = "Payment Service";

// JWT Key
const jwtKey = process.env.JWT_KEY;

// Database URL
const databaseURI = process.env.MONGO_URI;

// Nats Cluster ID
const natsClusterId = process.env.NATS_CLUSTER_ID;

// Nats URL
const natsURL = process.env.NATS_URL;

// Nats Client Id (Pods Name)
const natsClientId = process.env.NATS_CLIENT_ID

// Stripe Key
const stripeKey = process.env.STRIPE_KEY;

// Logstash URL
const logstashUrl = process.env.LOGSTASH_URL

// Declare a global Functions
declare global {
    var logger: any;
}

// Function that Start Server
const start = async () => {

    // Check Env variables
    if (!jwtKey) {
        throw new Error("JWT_KEY variable not present in the environment");
    }

    if (!databaseURI) {
        throw new Error("MONGO_URI variable not present in the environment");
    }

    if (!natsClusterId) {
        throw new Error("NATS_CLUSTER_ID variable not present in the environment");
    }

    if (!natsURL) {
        throw new Error("NATS_URL variable not present in the environment");
    }

    if (!natsClientId) {
        throw new Error("NATS_CLIENT_ID variable not present in the environment");
    }

    if (!stripeKey) {
        throw new Error("STRIPE_KEY variable not present in the environment");
    }

    if (!logstashUrl) {
        throw new Error("LOGSTASH_URL variable not present in the environment");
    }

    // Init logger
    await loggerHelper.init(logstashUrl);
    global.logger = loggerHelper.logger;

    // Connect to Nats and MongoDB 
    try {

        await natsWrapper.connect(serviceName, natsClusterId, natsClientId, natsURL);

        natsWrapper.client.on('close', () => {
            logger.debug('NATS Connection closed!');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // Listening for events
        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

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