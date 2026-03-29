const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profileController');


// Public profile
router.get('/profile/:username', ctrl.getUserProfile);


module.exports = router;