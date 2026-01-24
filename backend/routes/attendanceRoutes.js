const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Helper to authenticate/authorize could be added here
// router.use(verifyToken); 


router.post('/mark', attendanceController.markAttendance);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getOneYearAttendance);
router.get('/member/:memberId', attendanceController.getMemberAttendance);

module.exports = router;
