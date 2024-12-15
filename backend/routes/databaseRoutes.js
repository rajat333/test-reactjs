const express = require('express');
const databaseController = require('../controllers/databaseController');

const router = express.Router();

router.get('/databases', databaseController.getDatabaseStructure);

module.exports = router;
