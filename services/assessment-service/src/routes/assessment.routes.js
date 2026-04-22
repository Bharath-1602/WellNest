const express = require('express');
const { body } = require('express-validator');
const assessmentCtrl = require('../controllers/assessment.controller');
const moodCtrl = require('../controllers/mood.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/templates', assessmentCtrl.getTemplates);
router.get('/templates/:type', assessmentCtrl.getTemplateByType);

router.post('/submit', authenticate, authorize('user'), [
  body('assessmentType').notEmpty().withMessage('Assessment type is required.'),
  body('answers').isArray({ min: 1 }).withMessage('Answers are required.')
], assessmentCtrl.submitAssessment);

router.get('/history', authenticate, authorize('user'), assessmentCtrl.getHistory);
router.get('/history/:type', authenticate, authorize('user'), assessmentCtrl.getHistoryByType);
router.get('/latest/:type', authenticate, authorize('user'), assessmentCtrl.getLatestByType);
router.get('/trends/:type', authenticate, authorize('user'), assessmentCtrl.getTrends);
router.get('/summary', authenticate, authorize('user'), assessmentCtrl.getSummary);
router.get('/insights', authenticate, authorize('user'), assessmentCtrl.getInsights);

router.post('/mood', authenticate, authorize('user'), [
  body('moodScore').isInt({ min: 1, max: 10 }).withMessage('Mood score must be 1-10.')
], moodCtrl.logMood);

router.patch('/mood/today', authenticate, authorize('user'), moodCtrl.updateTodayMood);
router.get('/mood/today', authenticate, authorize('user'), moodCtrl.getTodayMood);
router.get('/mood/week', authenticate, authorize('user'), moodCtrl.getWeekMood);
router.get('/mood/month', authenticate, authorize('user'), moodCtrl.getMonthMood);

router.get('/user/:userId/summary', authenticate, authorize('therapist'), assessmentCtrl.getUserSummary);
router.get('/user/:userId/mood', authenticate, authorize('therapist'), assessmentCtrl.getUserMood);

module.exports = router;
