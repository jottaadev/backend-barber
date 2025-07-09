// src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuração de conexão robusta para produção (Render + Supabase/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Exige uma conexão segura, mas não falha se o certificado não for auto-assinado.
    // Esta é a configuração mais compatível para a maioria dos provedores de cloud.
    rejectUnauthorized: false
  }
});

// Adiciona um listener para vermos nos logs se a conexão foi bem-sucedida
pool.on('connect', () => {
  console.log('✅ Base de dados conectada com sucesso!');
});

pool.on('error', (err) => {
    console.error('❌ Erro inesperado na conexão com a base de dados', err);
    process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};