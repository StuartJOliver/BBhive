const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let requestedPath = req.url;

  if (requestedPath === '/') {
    requestedPath = '/index.html';
  } else if (!path.extname(requestedPath)) {
    requestedPath += '.html';
  }

  const filePath = path.join(__dirname, requestedPath);
  const extname = path.extname(filePath) || '.html';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, '404.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404 || '404 Not Found');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      const contentType = getContentType(extname);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function getContentType(ext) {
  switch (ext) {
    case '.js': return 'text/javascript';
    case '.css': return 'text/css';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpg';
    case '.svg': return 'image/svg+xml';
    default: return 'text/html';
  }
}

server.listen(PORT, () => {
  console.log(`BB Hive running at http://localhost:${PORT}`);
});
