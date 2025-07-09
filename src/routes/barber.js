// src/routes/barber.js
const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const availabilityController = require('../controllers/availabilityController');
const { checkAuth } = require('../middleware/authMiddleware');

// Rota para o barbeiro ver os seus agendamentos pendentes
router.get('/my-appointments', checkAuth, barberController.getMyAppointments);

// Rota para o barbeiro ver o seu histórico de agendamentos
router.get('/history', checkAuth, barberController.getAppointmentHistory);

// Rota para o barbeiro ver a sua agenda de um dia específico
router.get('/schedule', checkAuth, availabilityController.getBarberDaySchedule);

// Rota para o barbeiro bloquear um horário
router.post('/block-slot', checkAuth, availabilityController.blockSlot);

// Rota para o barbeiro desbloquear um horário
router.delete('/unblock-slot', checkAuth, availabilityController.unblockSlot);

module.exports = router;