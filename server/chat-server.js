import { WebSocketServer } from 'ws';

const PORT = process.env.CHAT_WS_PORT || 4000;
const wss = new WebSocketServer({ port: PORT });

// Track connected clients and simple presence
const clients = new Map(); // ws -> { id, name }

function broadcast(data, exclude) {
  const message = JSON.stringify(data);
  for (const ws of wss.clients) {
    if (ws.readyState === ws.OPEN && ws !== exclude) {
      try { ws.send(message); } catch {}
    }
  }
}

wss.on('connection', (ws) => {
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
  clients.set(ws, { id, name: `User-${id.slice(-4)}` });

  // Send welcome and presence
  ws.send(JSON.stringify({ type: 'connected', payload: { id, users: Array.from(clients.values()) } }));
  broadcast({ type: 'presence', payload: { event: 'join', user: clients.get(ws) } }, ws);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      // Normalize message shape
      switch (msg.type) {
        case 'typing':
          broadcast({ type: 'typing', payload: { user: msg.user, isTyping: !!msg.isTyping } }, ws);
          break;
        case 'message': {
          const payload = {
            id: msg.id || `${Date.now()}`,
            content: msg.content,
            sender: msg.sender || 'user',
            user: msg.user,
            timestamp: msg.timestamp || new Date().toISOString(),
            meta: msg.meta || {}
          };
          broadcast({ type: 'message', payload }, undefined);
          break;
        }
        default:
          // ignore unknown
          break;
      }
    } catch (e) {
      // ignore malformed
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    clients.delete(ws);
    broadcast({ type: 'presence', payload: { event: 'leave', user: info } }, ws);
  });

  // Keepalive pings
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
});

// Heartbeat to clean up dead connections
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { try { ws.terminate(); } catch {} ; continue; }
    ws.isAlive = false; try { ws.ping(); } catch {}
  }
}, 30000);

wss.on('close', () => clearInterval(interval));

console.log(`Realtime Chat WS server listening on ws://localhost:${PORT}`);
