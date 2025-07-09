// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Função para verificar se o utilizador está autenticado
const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Token inválido.' });
  }
};

// Função para verificar se o utilizador é um admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado. Apenas para administradores.' });
  }
};

module.exports = {
  checkAuth,
  isAdmin,
};