// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

// --- SUGESTÃO DE CORS PARA DEPURAÇÃO ---
// Esta configuração é mais permissiva e pode ajudar a diagnosticar se o CORS é o problema.
// Para produção, volte a usar a lista de origens permitidas.
app.use(cors()); 

/*
// --- CONFIGURAÇÃO DE CORS PROFISSIONAL (PARA QUANDO TUDO ESTIVER A FUNCIONAR)---
const allowedOrigins = [
  'http://localhost:3000',
  'https://saas-barbearia.vercel.app' // Verifique se esta URL está exata
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS para este site não permite o acesso.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
*/


// --- O RESTO DO FICHEIRO CONTINUA IGUAL ---

// 1. Aplica as configurações de JSON.
app.use(express.json());

// 2. Serve os ficheiros estáticos (uploads de fotos).
app.use('/uploads', express.static('uploads'));

// 3. Importa todas as rotas.
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const barberRoutes = require('./routes/barber');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const workingHoursRoutes = require('./routes/workingHours');
const storeRoutes = require('./routes/store');

// 4. Regista todas as rotas na aplicação.
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/store', storeRoutes);

// 5. Finalmente, inicia o servidor.
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});