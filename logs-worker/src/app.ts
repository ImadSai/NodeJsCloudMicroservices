import Queue from "bull";

// Max jobs per worker
let maxJobsPerWorker = 50;

// Create Redis client
const expirationQueue = new Queue<any>('work', 'redis://127.0.0.1:6379');

expirationQueue.process(maxJobsPerWorker, async (job) => {

    console.log(job.data);

});