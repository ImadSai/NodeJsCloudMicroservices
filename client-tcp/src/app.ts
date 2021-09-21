import net from 'net';

const serviceName = "Logging_centralize";
const PORT = 3000
const IP = '127.0.0.1'

var client = new net.Socket();

client.connect(PORT, IP, function () {
    console.log('Connected');
    client.write('Hello, server! Love, Client.');
});

client.on('close', function () {
    console.log('Connection closed');
});

client.on('end', function () {
    console.log('Server shutdown');
});
