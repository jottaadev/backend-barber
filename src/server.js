// src/server.js
const express = require('express');
const cors = require('cors');

// 1. Carrega as variáveis de ambiente do arquivo .env
// Coloque esta linha no topo para garantir que as variáveis estejam disponíveis
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

// Configuração de CORS robusta
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 2. Novo endpoint para o login da estação de trabalho
// Adicionado aqui para clareza, antes das outras rotas
app.post('/api/auth/station-login', (req, res) => {
  const { username, password } = req.body;

  // Carrega as credenciais seguras das variáveis de ambiente
  const stationUser = process.env.STATION_USER;
  const stationPass = process.env.STATION_PASS;

  if (!username || !password) {
    return res.status(400).json({ error: 'Utilizador e senha são obrigatórios.' });
  }

  // Compara as credenciais recebidas com as credenciais seguras
  if (username === stationUser && password === stationPass) {
    return res.status(200).json({ message: 'Login da estação bem-sucedido' });
  } else {
    return res.status(401).json({ error: 'Utilizador ou senha da estação inválidos.' });
  }
});


// Importar todas as nossas rotas (cada uma apenas uma vez)
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const barberRoutes = require('./routes/barber');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const workingHoursRoutes = require('./routes/workingHours');

// Usar as rotas com um prefixo /api
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/working-hours', workingHoursRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend a rodar na porta ${PORT}`);
});