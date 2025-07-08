// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Agora importamos o objeto inteiro que contém as nossas duas funções
const { checkAuth, isAdmin } = require('../middleware/authMiddleware');

// Usamos checkAuth primeiro, e depois isAdmin, em cada rota protegida
router.get('/stats', [checkAuth, isAdmin], adminController.getDashboardStats);
router.get('/appointments', [checkAuth, isAdmin], adminController.getAllAppointments);
router.get('/charts/revenue', [checkAuth, isAdmin], adminController.getRevenueChartData);
router.get('/reports/performance', [checkAuth, isAdmin], adminController.getPerformanceReport);

module.exports = router;