const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const messages = []; // In-memory message store

function getContentType(ext) {
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/messages') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(messages));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data && data.user && data.text) {
            messages.push({
              user: data.user.slice(0, 50),
              text: data.text.slice(0, 200),
            });
            if (messages.length > 100) messages.shift();
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } else {
            res.writeHead(400);
            res.end('Invalid message format');
          }
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
    } else {
      res.writeHead(405);
      res.end('Method Not Allowed');
    }
    return;
  }

  // Serve static files
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  if (!path.extname(filePath)) filePath += '.html';

  const extname = path.extname(filePath);
  const contentType = getContentType(extname);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile('./404.html', (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(err404 ? '404 Not Found' : content404);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
