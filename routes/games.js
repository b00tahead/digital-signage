// games.js - Games route module
var express = require('express');
var router = express.Router();

var game_controller = require('../controllers/gameController');

// Games page route
router.get('/', game_controller.composite_schedule);

// Team page route
router.get('/:scheduleId', game_controller.schedule_detail);

module.exports = router;
