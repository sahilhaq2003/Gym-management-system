const express = require('express');
const router = express.Router();
const { getAllMembers, createMember, getMemberById } = require('../controllers/memberController');

// Add middleware for auth protection later
// const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllMembers);
router.post('/', createMember);
router.get('/:id', getMemberById);
router.put('/:id', require('../controllers/memberController').updateMember);
router.delete('/:id', require('../controllers/memberController').deleteMember);

// Schedule Routes
router.get('/:id/schedule', require('../controllers/memberController').getMemberSchedule);
router.post('/:id/schedule', require('../controllers/memberController').updateMemberSchedule);
router.delete('/:id/schedule/:itemId', require('../controllers/memberController').deleteScheduleItem);
router.get('/:id/schedule/completions', require('../controllers/memberController').getScheduleCompletions);
router.post('/:id/schedule/:itemId/completion', require('../controllers/memberController').toggleScheduleCompletion);

// Membership Routes
router.get('/:id/membership', require('../controllers/memberController').getMemberMembership);

module.exports = router;
