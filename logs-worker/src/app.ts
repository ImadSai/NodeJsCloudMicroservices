import Queue from "bull";
import axios from 'axios';

// Max jobs per worker
let maxJobsPerWorker = 50;

// Delay to retry (10 secondes)
const delay = 5 * 1000;

// Redis Host
const redisHost = "127.0.0.1:6379";

// Logstash Host
const logstashHost = "http://192.168.1.109:5000";

// Create Redis client
const logQueue = new Queue<any>('work', 'redis://' + redisHost);

// Request config
let config = {
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
};

// Process a log when available
logQueue.process(maxJobsPerWorker, async (job, done) => {

    console.log(`Processing Job-${job.id}`);
    const log = JSON.stringify(job.data);

    // Push the log
    await axios.post(logstashHost, log, config).then(res => {
        console.log(`Job-${job.id} done.`);
        done();
    }).catch(async err => {
        console.log(`Job-${job.id} failed. retrying`);
        retryOnFailure(job, log);
        done(err);
    });
});

// Retry function on failure
async function retryOnFailure(job: Queue.Job, log: string) {
    await logQueue.add(log, {
        attempts: 10,
        backoff: {
            type: "exponential",
            delay: delay
        }
    }, {
        jobId: job.id,
        removeOnComplete: true,
        removeOnFail: false
    });
}