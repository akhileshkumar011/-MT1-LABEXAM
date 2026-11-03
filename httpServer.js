// Part A: HTTP module + FS module (no Express)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Port 3000 as required; to use another port run e.g.  PORT=3001 node httpServer.js
const PORT = process.env.PORT || 3001;

// Small shared page template for the simple HTML routes (/, /about, 404)
const renderPage = (title, bodyHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f1e7; color: #1f2a24; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
    .box { max-width: 560px; margin: 24px; padding: 40px; background: #fffdf8; border: 1px solid #e3dbc8; border-radius: 16px; box-shadow: 0 8px 24px rgba(31,42,36,.08); }
    h1 { font-family: Georgia, serif; margin: 0 0 12px; font-size: 2rem; line-height: 1.15; }
    p { color: #6b7467; line-height: 1.6; }
    .links a { display: inline-block; margin: 6px 8px 0 0; padding: 9px 16px; border-radius: 99px; background: #1f4d3a; color: #fff; text-decoration: none; font-size: .9rem; }
    .links a.alt { background: #e4efe8; color: #1f4d3a; }
    ul { color: #6b7467; line-height: 1.8; padding-left: 20px; }
  </style>
</head>
<body><div class="box">${bodyHtml}</div></body>
</html>`;

// In-memory book store (no database)
const books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350 },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 450 },
  { id: 3, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', price: 300 },
];

// Helper to send JSON responses
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // A2 + A3: GET routes
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      renderPage(
        'Welcome',
        `<h1>Welcome to the Library Book Management System</h1>
         <p>Browse the catalogue, add new books and explore the routes of this Node.js HTTP server.</p>
         <div class="links"><a href="/home">Open the library</a><a class="alt" href="/books">View books (JSON)</a><a class="alt" href="/about">About</a></div>`
      )
    );
  } else if (method === 'GET' && url === '/books') {
    sendJSON(res, 200, books);
  } else if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      renderPage(
        'About',
        `<h1>About this application</h1>
         <p>Library Book Management is a small web application built for the MT1 Lab Examination (Full Stack Development).</p>
         <ul>
           <li>Part A: Node.js <b>http</b> and <b>fs</b> modules (port 3000)</li>
           <li>Part B: REST API with <b>Express.js</b> (port 4000)</li>
           <li>Data is kept in a JavaScript array, no database</li>
         </ul>
         <div class="links"><a href="/">Back to welcome</a><a class="alt" href="/home">Open the library</a></div>`
      )
    );
  } else if (method === 'GET' && url === '/home') {
    // A4: serve static HTML using the FS module
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error: could not read index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }
  // A3: POST /add-book
  else if (method === 'POST' && url === '/add-book') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let book;
      try {
        book = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }

      // A5: validate required fields
      const { id, title, author, price } = book;
      if (id === undefined || !title || !author || price === undefined) {
        return sendJSON(res, 400, {
          error: 'id, title, author and price are required',
        });
      }
      if (books.some((b) => b.id === id)) {
        return sendJSON(res, 409, { error: 'A book with this id already exists' });
      }

      const newBook = { id, title, author, price };
      books.push(newBook);
      sendJSON(res, 201, { message: 'Book added successfully', book: newBook });
    });
  }
  // A5: invalid routes
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(
      renderPage(
        '404 - Not Found',
        `<h1>404 - Route Not Found</h1>
         <p>The page you asked for does not exist on this server.</p>
         <div class="links"><a href="/">Go to welcome page</a></div>`
      )
    );
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
