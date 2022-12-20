const client = new WebSocket('ws://localhost:3000/websocket');
client.onopen = e => {
  client.send(JSON.stringify({type:'host'}));
}
client.onmessage = e => {
    console.log(e)
}