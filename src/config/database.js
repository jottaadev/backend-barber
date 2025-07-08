// src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Diz explicitamente para não usar SSL
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};