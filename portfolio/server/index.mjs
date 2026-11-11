import {chooseDevPort, isPortInUse} from './port.mjs';
import express from 'express';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Server} from 'socket.io';

const root = fileURLToPath(new URL('..', import.meta.url));
const colors = ['#b7a2ff', '#75e2b0', '#ffbe80', '#84caff', '#f6a2d5', '#f2db86'];
const sections = new Set(['home','work','about','skills','experience','contact']);
const cleanName = (value) => typeof value === 'string' ? value.replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0,24) : '';

export async function createPortfolioServer({dev = false, host = '127.0.0.1', port = 5173, allowedOrigins = []} = {}) {
  const app = express();
  app.disable('x-powered-by');
  const http = createServer(app);
  const peers = new Map();
  let sequence = 0;
  const originAllowed = (req) => {
    const origin = req.headers.origin;
    if (!origin) return true; // same-origin polling and server health clients may omit Origin
    try { return new URL(origin).host === req.headers.host || allowedOrigins.includes(origin); }
    catch { return false; }
  };
  const io = new Server(http, {
    maxHttpBufferSize: 4096, pingInterval: 10000, pingTimeout: 5000,
    serveClient: false,
    cors: {origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)), methods: ['GET','POST']},
    allowRequest: (req, cb) => cb(null, originAllowed(req)),
  });
  io.use((socket, next) => peers.size < 80 ? next() : next(new Error('The live room is full. Please try again later.')));
  const roster = () => [...peers.values()].map(({lastMove, lastName, ...peer}) => peer);
  io.on('connection', socket => {
    const index = sequence++;
    const peer = {
      id: randomUUID(),
      name: cleanName(socket.handshake.auth?.name) || (index % 2 ? 'Designer ' : 'Developer ') + String(index + 1).padStart(2,'0'),
      color: index < colors.length ? colors[index] : 'hsl(' + ((index * 137.508) % 360) + ' 70% 76%)', position: null, lastMove: 0, lastName: 0
    };
    peers.set(socket.id, peer);
    socket.emit('welcome', {id: peer.id, peers: roster()});
    io.emit('roster', roster());
    socket.on('cursor', value => {
      const now = Date.now();
      if (now - peer.lastMove < 40) return;
      peer.lastMove = now;
      if (value === null) {
        peer.position = null;
      } else {
        if (!value || !sections.has(value.section) || !Number.isFinite(value.x) || !Number.isFinite(value.y) ||
            value.x < 0 || value.x > 1 || value.y < 0 || value.y > 1) return;
        peer.position = {section: value.section, x: value.x, y: value.y};
      }
      socket.broadcast.volatile.emit('cursor', {id: peer.id, position: peer.position});
    });
    socket.on('rename', value => {
      if (Date.now() - peer.lastName < 1000) return;
      const name = cleanName(value);
      if (!name) return;
      peer.lastName = Date.now();
      peer.name = name;
      io.emit('roster', roster());
    });
    socket.on('disconnect', () => {
      peers.delete(socket.id);
      io.emit('roster', roster());
    });
  });
  app.get('/health', (_req,res) => res.json({status:'ok', visitors:peers.size}));
  app.get('/api/presence-config', (_req,res) => res.set('Cache-Control','no-store').json({enabled:true}));
  let vite;
  if (dev) {
    const {createServer: createViteServer} = await import('vite');
    vite = await createViteServer({root, server:{middlewareMode:true, hmr:{server:http}}, appType:'spa'});
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(root,'dist')));
    app.get('/', (_req,res) => res.sendFile(path.join(root,'dist/index.html')));
  }
  await new Promise((resolve,reject) => {http.once('error',reject);http.listen(port,host,resolve)});
  const address = http.address();
  return {
    http, io, port:address.port,
    close: async () => { io.disconnectSockets(true); http.closeIdleConnections(); await new Promise(resolve => io.close(resolve)); await vite?.close(); http.closeAllConnections(); }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dev = process.argv.includes('--dev');
  const host=process.env.HOST || (dev ? '127.0.0.1' : '0.0.0.0');
  const preferred=Number(process.env.PORT || (dev ? 5173 : 3000));
  if(!Number.isInteger(preferred)||preferred<1||preferred>65535)throw new Error('PORT must be between 1 and 65535.');
  const port=dev&&!process.env.PORT ? await chooseDevPort(preferred,host) : preferred;
  if(dev&&process.env.PORT&&await isPortInUse(port,host))throw new Error('Requested PORT is already in use. Stop the old server or set another PORT.');
  if(port!==preferred)console.log('Port '+preferred+' is already in use. Using '+port+' for the website AND live cursors.');
  const app = await createPortfolioServer({
    dev, port, host,
    allowedOrigins:(process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean)
  });
  console.log('Portfolio + live cursors: http://127.0.0.1:' + app.port);
  let closing = false;
  const close = async () => {if(closing)return;closing=true;await app.close();process.exit(0)};
  process.on('SIGINT',close);process.on('SIGTERM',close);
}
