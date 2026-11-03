// Part A: HTTP module + FS module (no Express)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

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
    res.end('<h1>Welcome to the Library Book Management System</h1>');
  } else if (method === 'GET' && url === '/books') {
    sendJSON(res, 200, books);
  } else if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Library Book Management App - built with the Node.js HTTP and FS modules.');
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
    res.end('<h1>404 - Route Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
