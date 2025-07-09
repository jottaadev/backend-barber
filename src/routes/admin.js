// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAuth, isAdmin } = require('../middleware/authMiddleware');

const adminOnly = [checkAuth, isAdmin];

router.get('/stats', adminOnly, adminController.getDashboardStats);
router.get('/appointments', adminOnly, adminController.getAllAppointments);
router.get('/charts/revenue', adminOnly, adminController.getRevenueChartData);
router.get('/reports/performance', adminOnly, adminController.getPerformanceReport);

module.exports = router;