require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
if (process.env.FRONTEND_URL) {
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
}
app.use('/api', usersRouter);
app.use('/api', recipesRouter);

app.get('/', (req, res) => res.send('Hello from CodeBox!'));
app.get('/app', (req, res) => res.redirect('/login'));

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get(['/login', '/home'], (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`CodeBox server listening at http://localhost:${PORT}/app`));
}

module.exports = app;
