import mongoose from 'mongoose';
import { app } from './app';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { natsWrapper } from './nats-wrapper';
import { loggerHelper } from '@isticketing/common';
import Net from 'net';

// Port Used
const port = 3000;

// Application name
const applicationName = "ticketing";

// Service name
const serviceName = "OrdersService";

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

    // Check Logstash connection
    const client = new Net.Socket();
    client.connect({ port: 5000, host: "192.168.1.109" }, function () {
        console.log('TCP connection established with the server.');
    });
    client.on('end', function () {
        console.log('Requested an end to the TCP connection');
    });

    // Init logger
    await loggerHelper.init({
        logsServiceHost: "logs-srv",
        logsServicePort: 3000,
        applicationName: applicationName,
        serviceName: serviceName
    });
    global.logger = loggerHelper.logger;

    // Init third dependencies
    try {

        // Connect to natsWrapper
        await natsWrapper.connect(serviceName, natsClusterId, natsClientId, natsURL);
        natsWrapper.client.on('close', () => {
            logger.debug('NATS Connection closed!');
            process.exit();
        });

        // Connect to Database
        logger.debug(`${serviceName} - Connection to DB...`);
        await mongoose.connect(databaseURI);
        logger.debug(`${serviceName} - Connected to DB`);

    } catch (err) {
        logger.error(`${serviceName} - Error : ${err}`);
        process.exit();
    }

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    // Listening for events
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // Publish service
    app.listen(port, () => {
        logger.info(`${serviceName} - listing on port : ${port}`);
    });
};

// Start the Server
start();