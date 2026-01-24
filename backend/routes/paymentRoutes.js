const express = require('express');
const router = express.Router();
const { getAllPayments, createPayment, getMemberPayments } = require('../controllers/paymentController');

router.get('/', getAllPayments);
router.post('/', createPayment);
router.get('/member/:id', getMemberPayments);

module.exports = router;
