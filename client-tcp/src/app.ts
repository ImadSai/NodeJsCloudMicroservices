import net from 'net';

const serviceName = "Logging_centralize";
const PORT = 9000
const HOST = 'ticketing.test'

var client = new net.Socket();

client.connect(PORT, HOST, function () {
    console.log('Connected');
    client.write('Hello, server! Love, Client.');
});

client.on('close', function () {
    console.log('Connection closed');
});

client.on('end', function () {
    console.log('Server shutdown');
});
