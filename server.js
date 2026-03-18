const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function resolvePath(urlPath) {
  const sanitized = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = sanitized === '/' ? '/index.html' : sanitized;
  const filePath = path.normalize(path.join(ROOT, relativePath));

  if (!filePath.startsWith(ROOT)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Pokemon Custom Battle Simulator is running at http://127.0.0.1:${PORT}`);
});
