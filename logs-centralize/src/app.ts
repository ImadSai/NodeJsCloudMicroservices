import express from 'express';
import Queue from "bull";
import { Request, Response } from 'express';

const serviceName = "Logs_centralize";
const port = 3000;

// Create Redis client
const logsQueue = new Queue<any>('work', 'redis://127.0.0.1:6379');

const app = express();

// Disable powered by
app.disable("x-powered-by");

app.use(express.json());

// Job Options
let jobOptions = {
    removeOnComplete: true,
    removeOnFail: false
};

app.post('/', async (req: Request, res: Response) => {
    const log = req.body;
    await logsQueue.add(log, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        }
    }, jobOptions);
    res.status(200).send();
});

// Publish service
app.listen(port, () => {
    console.log(`${serviceName} - listing on port : ${port}`);
});