const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (url.pathname === '/api/health') {
    return send(res, 200, JSON.stringify({ ok: true, app: 'RoutER' }), TYPES['.json']);
  }

  if (url.pathname === '/api/destinations') {
    const dataPath = path.join(PUBLIC_DIR, 'data', 'destinations.json');
    return fs.readFile(dataPath, (error, data) => {
      if (error) return send(res, 500, JSON.stringify({ error: 'Destination data is unavailable.' }), TYPES['.json']);
      send(res, 200, data, TYPES['.json']);
    });
  }

  const requestPath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const filePath = path.resolve(PUBLIC_DIR, `.${requestPath}`);
  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`) && filePath !== path.join(PUBLIC_DIR, 'index.html')) {
    return send(res, 403, 'Forbidden');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) return send(res, error.code === 'ENOENT' ? 404 : 500, 'Not found');
    send(res, 200, data, TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(PORT, HOST, () => {
  console.log(`RoutER is ready at http://${HOST}:${PORT}`);
});
