// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth, isAdmin } = require('../middleware/authMiddleware');

// Define um array de middleware para ser aplicado a todas as rotas de admin
const adminOnly = [checkAuth, isAdmin];

// As rotas agora usam o array de middleware
router.get('/stats', adminOnly, adminController.getDashboardStats);
router.get('/appointments', adminOnly, adminController.getAllAppointments);
router.get('/charts/revenue', adminOnly, adminController.getRevenueChartData);
router.get('/reports/performance', adminOnly, adminController.getPerformanceReport);

module.exports = router;