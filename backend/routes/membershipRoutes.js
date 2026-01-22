const express = require('express');
const router = express.Router();
const { getPlans, requestMembership, getPendingMemberships, approveMembership, rejectMembership } = require('../controllers/membershipController');

router.get('/plans', getPlans);
router.post('/request', requestMembership);
router.get('/pending', getPendingMemberships);
router.put('/:id/approve', approveMembership);
router.put('/:id/reject', rejectMembership);

module.exports = router;
