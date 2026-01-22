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

module.exports = router;
