// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Garante que o .env é lido

const app = express();
const PORT = process.env.PORT || 3333;

// --- CONFIGURAÇÃO DE CORS ROBUSTA ---
// Esta configuração garante que os pedidos de segurança (preflight) funcionem.
const corsOptions = {
  // ATENÇÃO: No futuro, para produção, substitua '*' pelo endereço do seu site no Vercel.
  // Ex: origin: 'https://barbearia-frontend.vercel.app'
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite todos os métodos que usamos
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite os cabeçalhos necessários
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
const workingHoursRoutes = require('./routes/workingHours');
const storeRoutes = require('./routes/store');

// Usar as rotas com um prefixo /api
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/store', storeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});