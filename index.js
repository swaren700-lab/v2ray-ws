const http = require('http');
const net = require('net');
const tls = require('tls');

const PORT = process.env.PORT || 8080;
const TARGET_HOST = process.env.TARGET_HOST || 'fr-full.privateip.net';
const TARGET_PORT = parseInt(process.env.TARGET_PORT) || 443;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});

server.on('upgrade', (req, socket, head) => {
  const conn = tls.connect({
    host: TARGET_HOST,
    port: TARGET_PORT,
    servername: TARGET_HOST,
    rejectUnauthorized: false
  }, () => {
    const wsKey = req.headers['sec-websocket-key'];
    const path = req.url || '/ws';
    conn.write(
      `GET ${path} HTTP/1.1\r\n` +
      `Host: ${TARGET_HOST}\r\n` +
      `Upgrade: websocket\r\n` +
      `Connection: Upgrade\r\n` +
      `Sec-WebSocket-Key: ${wsKey}\r\n` +
      `Sec-WebSocket-Version: 13\r\n\r\n`
    );
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n');
    conn.pipe(socket);
    socket.pipe(conn);
  });
  conn.on('error', () => socket.destroy());
  socket.on('error', () => conn.destroy());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
