// src/routes/workingHours.js
const express = require('express');
const router = express.Router();
const workingHoursController = require('../controllers/workingHoursController');
const { checkAuth } = require('../middleware/authMiddleware');

// Todas as rotas aqui são protegidas, o utilizador precisa de estar logado
// para gerir os seus próprios horários.

// GET /api/working-hours -> Busca os horários do barbeiro logado
router.get('/', checkAuth, workingHoursController.getWorkingHours);

// POST /api/working-hours -> Adiciona um novo horário
router.post('/', checkAuth, workingHoursController.addWorkingHour);

// DELETE /api/working-hours/:ruleId -> Apaga um horário específico
router.delete('/:ruleId', checkAuth, workingHoursController.deleteWorkingHour);

module.exports = router;