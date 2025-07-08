// src/routes/appointments.js
const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const authMiddleware = require('../middleware/authMiddleware'); // Precisamos do middleware para proteger a rota

// Rota para criar um novo agendamento (pública)
router.post('/', appointmentsController.create);

// --- ROTA CORRIGIDA E ADICIONADA AQUI ---
// Rota para atualizar o status de um agendamento.
// Ela está protegida: só um utilizador logado (barbeiro ou admin) pode aceder.
router.put('/:id/status', authMiddleware.checkAuth, appointmentsController.updateStatus);

module.exports = router;