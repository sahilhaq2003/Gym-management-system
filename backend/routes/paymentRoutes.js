const express = require('express');
const router = express.Router();
const { getAllPayments, createPayment, getMemberPayments, initiatePayHerePayment, payhereNotify } = require('../controllers/paymentController');

router.get('/', getAllPayments);
router.post('/', createPayment);
router.post('/payhere/initiate', initiatePayHerePayment);
router.post('/payhere/notify', payhereNotify);
router.get('/member/:id', getMemberPayments);

module.exports = router;
