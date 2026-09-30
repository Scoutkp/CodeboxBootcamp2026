const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const request = require('supertest');

process.env.JWT_SECRET = 'test-only-secret';
process.env.SUPABASE_DB_URL = 'postgresql://unused';

const app = require('../backend/server');
const server = http.createServer(app);
const { signToken } = require('../backend/middleware/auth');
const { validateRecipeInput } = require('../backend/services/recipeService');
test.before(() => new Promise((resolve) => server.listen(0, resolve)));
test.after(() => server.close());

test('rejects recipe requests without authentication', async () => {
  const response = await request(server).get('/api/users/1/recipes');
  assert.equal(response.status, 401);
});

test('rejects expired authentication tokens', async () => {
  const token = require('jsonwebtoken').sign({ sub: '1', exp: Math.floor(Date.now() / 1000) - 1 }, process.env.JWT_SECRET, { algorithm: 'HS256' });
  const response = await request(server).get('/api/users/1/recipes').set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 401);
});

test('prevents one user from accessing another user recipes', async () => {
  const response = await request(server).get('/api/users/2/recipes').set('Authorization', `Bearer ${signToken(1)}`);
  assert.equal(response.status, 403);
});

test('rejects malformed recipe identifiers before database access', async () => {
  const response = await request(server).delete('/api/users/1/recipes/nope').set('Authorization', `Bearer ${signToken(1)}`);
  assert.equal(response.status, 400);
});

test('validates recipe field types and sizes', () => {
  assert.equal(validateRecipeInput({ title: 42 }), 'title must be a string under 20000 characters');
  assert.equal(validateRecipeInput({ ingredients: 'x'.repeat(20001) }), 'ingredients must be a string under 20000 characters');
  assert.equal(validateRecipeInput({ title: 'Soup', ingredients: '', instructions: '' }), null);
});
