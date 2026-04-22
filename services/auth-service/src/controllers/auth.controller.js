const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { sub: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, role, phone, therapistProfile } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be registered.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userData = { name, email: email.toLowerCase(), passwordHash, role: role || 'user', phone: phone || '' };

    if (role === 'therapist' && therapistProfile) {
      userData.therapistProfile = {
        ...therapistProfile,
        isVerified: false,
        rating: 0,
        totalReviews: 0
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    res.status(201).json({ success: true, data: { token, user: user.toSafeObject() } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({ success: true, data: { token, user: user.toSafeObject() } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, therapistProfile } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (user.role === 'therapist' && therapistProfile) {
      const allowedFields = ['bio', 'sessionPrice', 'sessionDuration', 'languages', 'approachMethods', 'specializations'];
      allowedFields.forEach(field => {
        if (therapistProfile[field] !== undefined) {
          user.therapistProfile[field] = therapistProfile[field];
        }
      });
    }

    await user.save();
    res.json({ success: true, data: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updatePrivacy = async (req, res) => {
  try {
    const { shareAssessmentsWithTherapist, shareMoodWithTherapist } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (shareAssessmentsWithTherapist !== undefined) {
      user.privacySettings.shareAssessmentsWithTherapist = shareAssessmentsWithTherapist;
    }
    if (shareMoodWithTherapist !== undefined) {
      user.privacySettings.shareMoodWithTherapist = shareMoodWithTherapist;
    }

    await user.save();
    res.json({ success: true, data: user.privacySettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTherapists = async (req, res) => {
  try {
    const { specialization, language, maxPrice } = req.query;
    const filter = { role: 'therapist', 'therapistProfile.isVerified': true };

    if (specialization) {
      filter['therapistProfile.specializations'] = { $in: [specialization.toLowerCase()] };
    }
    if (language) {
      filter['therapistProfile.languages'] = { $regex: new RegExp(language, 'i') };
    }
    if (maxPrice) {
      filter['therapistProfile.sessionPrice'] = { $lte: Number(maxPrice) };
    }

    const therapists = await User.find(filter).select('-passwordHash -__v -privacySettings');
    res.json({ success: true, data: therapists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getPendingTherapists = async (req, res) => {
  try {
    const therapists = await User.find({
      role: 'therapist',
      'therapistProfile.isVerified': false
    }).select('-passwordHash -__v');
    res.json({ success: true, data: therapists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.verifyTherapist = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const therapist = await User.findById(req.params.id);

    if (!therapist || therapist.role !== 'therapist') {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }

    if (action === 'approve') {
      therapist.therapistProfile.isVerified = true;
      therapist.therapistProfile.verifiedAt = new Date();
      therapist.therapistProfile.verifiedBy = req.user.sub;
      therapist.therapistProfile.rejectionReason = undefined;
    } else if (action === 'reject') {
      therapist.therapistProfile.isVerified = false;
      therapist.therapistProfile.rejectionReason = reason || 'No reason provided.';
    } else {
      return res.status(400).json({ success: false, message: 'Action must be "approve" or "reject".' });
    }

    await therapist.save();
    res.json({ success: true, data: therapist.toSafeObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getInternalUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('_id name email role therapistProfile');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getInternalConsent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('privacySettings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user.privacySettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getInternalTherapists = async (req, res) => {
  try {
    const therapists = await User.find({
      role: 'therapist',
      'therapistProfile.isVerified': true
    }).select('_id name');
    res.json({ success: true, data: therapists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
