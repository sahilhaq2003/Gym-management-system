const express = require('express');
const router = express.Router();
const fingerprintController = require('../controllers/fingerprintController');

router.post('/register/options', fingerprintController.generateRegistrationOptions);
router.post('/register/verify', fingerprintController.verifyRegistration);
router.post('/auth/options', fingerprintController.generateAuthOptions);
router.post('/auth/verify', fingerprintController.verifyAuth);

module.exports = router;
