// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

// --- CONFIGURAÇÃO DE CORS PROFISSIONAL E SEGURA ---
const allowedOrigins = [
  'http://localhost:3000',
  // --- AÇÃO MUITO IMPORTANTE: SUBSTITUA PELO SEU ENDEREÇO REAL DO VERCEL ---
  'https://saas-barbearia.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS para este site não permite o acesso.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Adicionado OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- LINHA IMPORTANTE ---
// Responde aos pedidos de "preflight" (OPTIONS) com sucesso antes de qualquer outra rota.
app.options('*', cors(corsOptions)); 

// Aplica as opções de CORS a todas as outras rotas.
app.use(cors(corsOptions));


app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Importar e usar todas as rotas...
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const barberRoutes = require('./routes/barber');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const storeRoutes = require('./routes/store');
const workingHoursRoutes = require('./routes/workingHours');

app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/working-hours', workingHoursRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});