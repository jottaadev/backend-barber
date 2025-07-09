// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Função para verificar se o utilizador está autenticado
const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // --- DIAGNÓSTICO ---
  if (!process.env.JWT_SECRET) {
    console.error('--- ERRO CRÍTICO DE CONFIGURAÇÃO ---');
    console.error('A variável de ambiente JWT_SECRET não está definida no servidor!');
    // Não envie esta mensagem para o cliente por segurança, mas é vital no log.
    return res.status(500).json({ error: 'Erro de configuração interna do servidor.' });
  }

  if (!token) {
    // Isso é comum, o cliente pode não estar a enviar o token ainda.
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona os dados do utilizador (id, name, role) ao request
    // --- DIAGNÓSTICO ---
    console.log(`Token verificado com sucesso para o utilizador: ${req.user.name} (Role: ${req.user.role})`);
    next(); // O token é válido, continua para a rota
  } catch (error) {
    // --- DIAGNÓSTICO IMPORTANTE ---
    console.error('--- FALHA NA VERIFICAÇÃO DO TOKEN ---');
    console.error('Token recebido:', token);
    console.error('Erro detalhado:', error.message);
    console.error('------------------------------------');
    return res.status(400).json({ error: 'Token inválido ou expirado.' });
  }
};

// Função para verificar se o utilizador é um admin
const isAdmin = (req, res, next) => {
  // req.user foi definido no middleware checkAuth
  if (req.user && req.user.role === 'admin') {
    next(); // É um admin, pode passar
  } else {
    // --- DIAGNÓSTICO ---
    console.warn(`--- TENTATIVA DE ACESSO ADMIN NEGADA ---`);
    console.warn(`Utilizador: ${req.user?.name} (Role: ${req.user?.role}) tentou aceder a uma rota de admin.`);
    console.warn('--------------------------------------');
    return res.status(403).json({ error: 'Acesso negado. Apenas para administradores.' });
  }
};

module.exports = {
  checkAuth,
  isAdmin,
};