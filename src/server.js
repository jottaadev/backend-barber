// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Garante que o .env é lido no início

const app = express();
const PORT = process.env.PORT || 3333;

// --- CONFIGURAÇÃO DE CORS PROFISSIONAL ---
// Lista de endereços que têm permissão para "conversar" com o nosso backend
const allowedOrigins = [
  'http://localhost:3000', // Para os seus testes locais
  'https://saas-barbearia.vercel.app/' // O endereço do seu site online
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite pedidos sem 'origin' (como os de apps mobile ou do Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS para este site não permite o acesso a partir da origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));


app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Importar todas as nossas rotas
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const barberRoutes = require('./routes/barber');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

// Usar as rotas com um prefixo /api
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});