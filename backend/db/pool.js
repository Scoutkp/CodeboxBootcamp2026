const { Pool } = require('pg');

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('Missing SUPABASE_DB_URL. Add it to your local .env file.');
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
