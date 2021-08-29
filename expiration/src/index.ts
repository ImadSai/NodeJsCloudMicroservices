import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

// Service name
const serviceName = "Expiration Service";

// Nats Cluster ID
const natsClusterId = process.env.NATS_CLUSTER_ID;

// Nats URL
const natsURL = process.env.NATS_URL;

// Nats Client Id (Pods Name)
const natsClientId = process.env.NATS_CLIENT_ID

// Function that Start Server
const start = async () => {

    // Check Env variables
    if (!natsClusterId) {
        throw new Error("NATS_CLUSTER_ID variable not present in the environment");
    }

    if (!natsURL) {
        throw new Error("NATS_URL variable not present in the environment");
    }

    if (!natsClientId) {
        throw new Error("NATS_CLIENT_ID variable not present in the environment");
    }

    // Connect to Nats and MongoDB 
    try {

        await natsWrapper.connect(serviceName, natsClusterId, natsClientId, natsURL);

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // Listening for events
        new OrderCreatedListener(natsWrapper.client).listen();

    } catch (err) {
        console.log(`${serviceName} - Error : ${err}`);
    }
};

// Start the Server
start();