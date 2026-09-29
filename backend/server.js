require('dotenv').config();
const express = require('express');
const path = require('path');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', usersRouter);

app.get('/', (req, res) => res.send('Hello from CodeBox!'));
app.get('/app', (req, res) => res.redirect('/login'));

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get(['/login', '/home'], (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`CodeBox server listening at http://localhost:${PORT}/app`));
