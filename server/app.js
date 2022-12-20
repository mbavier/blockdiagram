
const express = require('express')
const WebSocket = require('ws')


const app = express()
const port = process.env.PORT || 3001

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('hi');
});

const wss = new WebSocket.Server({ server: app, path: '/websocket' })
wss.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};


var hosts = {};
var clientHost = {}
var connectedClients = [];
wss.on('connection', (ws, req) => {
  ws.id = wss.getUniqueID();
  console.log('Connection from ' + ws.id + ' ' + req.socket.remoteAddress);
  ws.send(JSON.stringify({type: "Welcome", data: ws.id}))
  ws.on('message', message => {
    message = JSON.parse(message)
    console.log(message)
    type = message.type
    sendMessage = message.data;
    console.log(sendMessage)
    wss.clients.forEach(function each(client) {
        if (client.id !== ws.id) {
            client.send(JSON.stringify({id: client.id, type: type, data: sendMessage}))
        }
    });
    
    // console.log(`Received message from ${ws.id}=> ${JSON.stringify(message)}`)
  });
  ws.on('close', message => {
    console.log("Goodbye " + ws.id);
  });
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});