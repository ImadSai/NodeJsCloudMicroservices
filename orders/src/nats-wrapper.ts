import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
    private _client?: Stan;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access NATS Client before connecting')
        }
        return this._client;
    }



    connect(serviceName: string, clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log(`${serviceName} - Connected to Nats - Cluster ID: ${clusterId}`);
                resolve();
            });
            this.client.on('error', (err) => {
                reject(err)
            });
        });
    }
}

// Singleton Nats Wrapper
export const natsWrapper = new NatsWrapper();