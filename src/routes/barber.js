// src/routes/barber.js
const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const availabilityController = require('../controllers/availabilityController');
const { checkAuth } = require('../middleware/authMiddleware');

// Rotas de Agendamentos
router.get('/my-appointments', checkAuth, barberController.getMyAppointments);
router.get('/history', checkAuth, barberController.getAppointmentHistory);

// Rotas de Disponibilidade
router.get('/schedule', checkAuth, availabilityController.getBarberDaySchedule);
router.post('/block-slot', checkAuth, availabilityController.blockSlot);
router.delete('/unblock-slot', checkAuth, availabilityController.unblockSlot);

// --- NOVAS ROTAS PARA GESTÃO DE AUSÊNCIAS ---
router.get('/absences', checkAuth, availabilityController.getAbsences);
router.post('/absences', checkAuth, availabilityController.addAbsence);
router.delete('/absences/:absenceId', checkAuth, availabilityController.deleteAbsence);

module.exports = router;