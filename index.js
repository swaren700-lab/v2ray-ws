const http = require('http');
const net = require('net');
const PORT = process.env.PORT || 8080;
const SSH_HOST = process.env.SSH_HOST || '127.0.0.1';
const SSH_PORT = parseInt(process.env.SSH_PORT) || 80;
const server = http.createServer((req, res) => {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('OK');
});
server.on('upgrade', (req, socket, head) => {
const conn = net.connect(SSH_PORT, SSH_HOST, () => {
socket.write('HTTP/1.1 101 Switching Protocols\r\n\r\n');
conn.pipe(socket);
socket.pipe(conn);
});
conn.on('error', () => socket.destroy());
socket.on('error', () => conn.destroy());
});
server.listen(PORT, '0.0.0.0', () => {
console.log('Server running on port ' + PORT);
});
