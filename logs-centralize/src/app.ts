import net from 'net';
import Queue from "bull";

const serviceName = "Logs_centralize";
const PORT = 3000
const IP = '127.0.0.1'

// Create Redis client
const expirationQueue = new Queue<any>('work', 'redis://127.0.0.1:6379');

// Create TCP Server
function createServer(): net.Server {
    return net.createServer((socket) => {

        // When client send Data
        socket.on('data', async (data) => {
            const log = { "data": data.toString() };
            console.log(log);
            expirationQueue.add(log);
        });

        // When socket is closed
        socket.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

// Create Server
var server = createServer();

// Server listen
server.listen(PORT, IP, () => {
    console.log(`${serviceName} - listing on : ${IP}:${PORT} (TCP)`);
});