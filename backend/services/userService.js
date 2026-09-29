const crypto = require('crypto');
const { promisify } = require('util');
const { Pool } = require('pg');

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('Missing SUPABASE_DB_URL. Add it to your local .env file.');
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
const scrypt = promisify(crypto.scrypt);

function publicUser(user) {
  if (!user) return undefined;
  return { id: Number(user.id), name: user.display_name || user.username };
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash).split(':');
  if (!salt || !key) return false;

  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function findUserById(id) {
  const result = await pool.query(
    'select id, username, display_name, password_hash from public.users where id = $1',
    [Number(id)],
  );
  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    'select id, username, display_name, password_hash from public.users where lower(username) = lower($1)',
    [String(username).trim()],
  );
  return result.rows[0];
}

async function getUsers() {
  const result = await pool.query('select id, username, display_name from public.users order by id');
  return result.rows.map(publicUser);
}

async function createUser(username, password) {
  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    'insert into public.users (username, password_hash) values ($1, $2) returning id, username',
    [username.trim(), passwordHash],
  );
  return publicUser(result.rows[0]);
}

async function findOrCreateGoogleUser(payload) {
  const existing = await pool.query(
    'select id, username, display_name from public.users where google_subject = $1',
    [payload.sub],
  );
  if (existing.rows[0]) {
    if (!existing.rows[0].display_name && payload.name) {
      const updated = await pool.query(
        'update public.users set display_name = $1 where google_subject = $2 returning id, username, display_name',
        [payload.name, payload.sub],
      );
      return publicUser(updated.rows[0]);
    }
    return publicUser(existing.rows[0]);
  }

  const username = payload.email || `google_${payload.sub}`;
  const result = await pool.query(
    'insert into public.users (username, password_hash, email, google_subject, display_name) values ($1, null, $2, $3, $4) returning id, username, display_name',
    [username, payload.email || null, payload.sub, payload.name || null],
  );
  return publicUser(result.rows[0]);
}

module.exports = {
  publicUser,
  findUserById,
  findUserByUsername,
  getUsers,
  createUser,
  verifyPassword,
  findOrCreateGoogleUser,
};
