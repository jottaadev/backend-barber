// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para o login principal (usado pelo admin para redefinir senhas, por exemplo)
router.post('/login', authController.login);

// Rota para o novo login de perfil, sem senha
router.post('/profile-login', authController.profileLogin);

module.exports = router;