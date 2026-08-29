import http from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const root = new URL('./dist', import.meta.url).pathname;
const port = Number(process.env.PORT || 8081);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = normalize(join(root, urlPath));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    try {
      if (statSync(file).isDirectory()) file = join(file, 'index.html');
      const data = readFileSync(file);
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      const data = readFileSync(join(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    }
  })
  .listen(port, '0.0.0.0', () => console.log(`serving ${root} on 0.0.0.0:${port}`));
