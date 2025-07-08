// src/routes/store.js
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Rota para o login da estação
router.post('/login', storeController.login);

module.exports = router;