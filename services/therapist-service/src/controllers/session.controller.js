const axios = require('axios');
const Session = require('../models/Session');
const SessionNote = require('../models/SessionNote');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

const generateSessionNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WN-S-${year}-${rand}`;
};

exports.bookSession = async (req, res) => {
  try {
    const { therapistId, scheduledDate, scheduledTime, mode, userNotes } = req.body;

    const existing = await Session.findOne({
      therapistId, scheduledDate, scheduledTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This slot is already booked.' });
    }

    let therapistName = 'Therapist';
    let sessionFee = 0;
    try {
      const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/user/${therapistId}`, {
        headers: { 'X-Internal-Service': 'therapist-service' }
      });
      therapistName = data.data.name;
      if (data.data.therapistProfile) {
        sessionFee = data.data.therapistProfile.sessionPrice || 0;
      }
    } catch (e) {
      console.error('Failed to fetch therapist info:', e.message);
    }

    const session = await Session.create({
      sessionNumber: generateSessionNumber(),
      userId: req.user.sub,
      userName: req.user.name,
      therapistId,
      therapistName,
      scheduledDate,
      scheduledTime,
      mode: mode || 'video',
      sessionFee,
      userNotes,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.sub }).sort({ scheduledDate: -1, scheduledTime: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUpcomingSessions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await Session.find({
      userId: req.user.sub,
      scheduledDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ scheduledDate: 1, scheduledTime: 1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.userId.toString() !== req.user.sub && session.therapistId.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Session cannot be cancelled.' });
    }

    session.status = 'cancelled';
    session.cancellationReason = req.body.reason || '';
    session.cancelledBy = req.user.role === 'therapist' ? 'therapist' : 'user';
    session.updatedAt = new Date();
    await session.save();

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTherapistSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ therapistId: req.user.sub }).sort({ scheduledDate: -1, scheduledTime: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTodaySessions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await Session.find({
      therapistId: req.user.sub,
      scheduledDate: today
    }).sort({ scheduledTime: 1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.confirmSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.therapistId.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    session.status = 'confirmed';
    session.updatedAt = new Date();
    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.therapistId.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    session.status = 'completed';
    session.updatedAt = new Date();
    await session.save();
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.saveNotes = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.therapistId.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const noteData = {
      sessionId: session._id,
      therapistId: req.user.sub,
      userId: session.userId,
      ...req.body,
      updatedAt: new Date()
    };

    const note = await SessionNote.findOneAndUpdate(
      { sessionId: session._id },
      noteData,
      { upsert: true, new: true }
    );

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.therapistId.toString() !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const note = await SessionNote.findOne({ sessionId: session._id });
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
