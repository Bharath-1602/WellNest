const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const { authenticate, authorize, internalOnly } = require('../middleware/auth.middleware');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many registration attempts. Try again later.' }
});

router.post('/register', registerLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['user', 'therapist']).withMessage('Role must be user or therapist.')
], controller.register);

router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
], controller.login);

router.get('/me', authenticate, controller.getMe);
router.patch('/profile', authenticate, controller.updateProfile);
router.patch('/privacy', authenticate, controller.updatePrivacy);

router.get('/therapists', controller.getTherapists);

router.get('/therapists/pending', authenticate, authorize('admin'), controller.getPendingTherapists);
router.patch('/therapists/:id/verify', authenticate, authorize('admin'), controller.verifyTherapist);

router.get('/internal/user/:id', internalOnly, controller.getInternalUser);
router.get('/internal/consent/:id', internalOnly, controller.getInternalConsent);
router.get('/internal/therapists', internalOnly, controller.getInternalTherapists);

module.exports = router;
