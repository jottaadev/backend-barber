// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

// --- CONFIGURAÇÃO DE CORS PROFISSIONAL E SEGURA ---
// Lista de endereços que têm permissão para "conversar" com o nosso backend
const allowedOrigins = [
  'http://localhost:3000', // Para os seus testes locais
  // ADICIONE AQUI O ENDEREÇO DO SEU SITE NO VERCEL
  'https://saas-barbearia.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite pedidos se a origem estiver na nossa lista ou se não houver origem (ex: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A política de CORS para este site não permite o acesso.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

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