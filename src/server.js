const http = require('http');
const WebSocket = require('ws');

const app = require('./app');

const server = http.createServer(app);

const wss = new WebSocket.Server({ port: 8088 });

const menu = require('./data/menu.json');

let deliveries = [];
let adminSockets = [];

function wslog(message) {
  console.log("ws>", message);
}

wss.on("connection", function connectionListener(socket) {
  wslog("Client connected.");

  socket.send(JSON.stringify({ event: 'menu-update', content: menu.items }));

  socket.on("message", function onMessageListener(message) {
    var { event, content } = JSON.parse(message);

    switch (event) {
      case 'admin-connect':
        adminSockets.push(socket);

        socket.send(JSON.stringify({ event: 'deliveries-update', content: deliveries }));
        break;
      case 'new-delivery':
        deliveries.push(content);

        adminSockets.forEach(function callback(client) {
          client.send(JSON.stringify({ event: 'deliveries-update', content: deliveries }));
        });
        break;
      case 'delete-item':
        menu.items = menu.items.filter(i => i.name !== content);

        wss.clients.forEach(function callback(client) {
          client.send(JSON.stringify({ event: 'menu-update', content: menu.items }));
        });
        break;
      case 'store-item':
          menu.items.push(content);
  
          wss.clients.forEach(function callback(client) {
            client.send(JSON.stringify({ event: 'menu-update', content: menu.items }));
          });
          break;
    }
  });

  socket.on('close', function onCloseListener() {
    adminSockets = adminSockets.filter(s => s !== socket);
    wslog('Client disconnected.');
  });
});

server.listen(5000);