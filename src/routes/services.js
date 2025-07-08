// src/routes/services.js
const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { checkAuth, isAdmin } = require('../middleware/authMiddleware');

// A lista de serviços pode ser pública para a landing page
router.get('/', servicesController.listAll);

// As rotas de criação, atualização e exclusão agora são protegidas
router.post('/', [checkAuth, isAdmin], servicesController.create);
router.put('/:id', [checkAuth, isAdmin], servicesController.update);
router.delete('/:id', [checkAuth, isAdmin], servicesController.delete);

module.exports = router;