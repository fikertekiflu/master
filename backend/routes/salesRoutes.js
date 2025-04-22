const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Route to fetch sales data with optional filters
router.get('/data', salesController.getSalesData);

module.exports = router;