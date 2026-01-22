const express = require('express');
const router = express.Router();
const { getAllPlans, createPlan, assignPlanToMember, deletePlan } = require('../controllers/workoutPlanController');

router.get('/', getAllPlans);
router.post('/', createPlan);
router.post('/assign', assignPlanToMember);
router.delete('/:id', deletePlan);

module.exports = router;
