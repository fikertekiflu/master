const express = require('express');
const overviewController = require('../controllers/overviewController');
const router = express.Router();

router.get('/data', overviewController.getKpis); // Changed the route to '/data'

module.exports = router;