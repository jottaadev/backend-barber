// src/routes/public.js
const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// Rota pública para qualquer pessoa consultar a disponibilidade
router.get('/availability', availabilityController.getAvailableSlots);

module.exports = router;