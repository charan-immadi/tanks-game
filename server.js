const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT ? Number(process.env.PORT) : 5500;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const rel = clean === '/' ? '/index.html' : clean;
  const abs = path.join(ROOT, rel);
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws' });

let p1 = null;
let p2 = null;

function send(ws, obj) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(obj));
}

function refreshReady() {
  const ready = !!p1 && !!p2;
  send(p1, { type: 'ready', ready });
  send(p2, { type: 'ready', ready });
}

wss.on('connection', (ws) => {
  if (!p1) {
    p1 = ws;
    ws._seat = 1;
  } else if (!p2) {
    p2 = ws;
    ws._seat = 2;
  } else {
    send(ws, { type: 'full' });
    ws.close();
    return;
  }

  send(ws, { type: 'seat', seat: ws._seat });
  refreshReady();

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }

    const peer = ws._seat === 1 ? p2 : p1;
    if (!peer) return;

    if (msg.type === 'state') {
      send(peer, {
        type: 'state',
        x: Number(msg.x) || 0,
        z: Number(msg.z) || 0,
        facing: Number(msg.facing) || 0,
        turret: Number(msg.turret) || 0,
        speed: Number(msg.speed) || 0,
        hp: Number(msg.hp) || 0,
        alive: msg.alive !== false
      });
      return;
    }

    if (msg.type === 'fire') {
      send(peer, {
        type: 'fire',
        vx: Number(msg.vx) || 0,
        vz: Number(msg.vz) || 0
      });
    }
  });

  ws.on('close', () => {
    if (ws._seat === 1) p1 = null;
    if (ws._seat === 2) p2 = null;
    refreshReady();
  });
});

server.listen(PORT, () => {
  console.log('LAN server running on http://localhost:' + PORT);
  console.log('Open / on both devices in same network.');
});
