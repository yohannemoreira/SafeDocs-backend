import express, { Request, Response } from 'express';

const app = express();

app.get('/users', (request, response) => {
  return response.send('Hello World!');
});

app.listen(3000, () => {
console.log('HTTP Server running!');
});