// src/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { checkAuth, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

// A lista de perfis pode ser pública para a tela de seleção
router.get('/profiles', usersController.listAllProfiles);

// As rotas de gestão de equipa agora são protegidas
router.post('/', [checkAuth, isAdmin, upload.single('avatar')], usersController.createBarber);
router.put('/:id', [checkAuth, isAdmin, upload.single('avatar')], usersController.updateBarber);
router.delete('/:id', [checkAuth, isAdmin], usersController.deleteBarber);

module.exports = router;