const axios = require('axios');
const TherapistAvailability = require('../models/TherapistAvailability');
const Session = require('../models/Session');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const ASSESSMENT_SERVICE = process.env.ASSESSMENT_SERVICE_URL || 'http://assessment-service:3002';

exports.getDirectory = async (req, res) => {
  try {
    const { specialization, language, maxPrice } = req.query;
    let url = `${AUTH_SERVICE}/api/auth/therapists?`;
    if (specialization) url += `specialization=${specialization}&`;
    if (language) url += `language=${language}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;

    const { data } = await axios.get(url, {
      headers: { 'X-Internal-Service': 'therapist-service' }
    });
    res.json(data);
  } catch (error) {
    console.error('Directory error:', error.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTherapistProfile = async (req, res) => {
  try {
    const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/user/${req.params.id}`, {
      headers: { 'X-Internal-Service': 'therapist-service' }
    });
    res.json(data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ success: false, message: 'Therapist not found.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required.' });
    }

    const availability = await TherapistAvailability.findOne({ therapistId: id });
    if (!availability) {
      return res.json({ success: true, data: [] });
    }

    if (availability.blockedDates.includes(date)) {
      return res.json({ success: true, data: [] });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = availability.weeklySchedule[dayOfWeek];

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.json({ success: true, data: [] });
    }

    const bookedSessions = await Session.find({
      therapistId: id,
      scheduledDate: date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('scheduledTime');

    const bookedTimes = bookedSessions.map(s => s.scheduledTime);
    const availableSlots = daySchedule.timeSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    const { weeklySchedule, blockedDates } = req.body;

    const availability = await TherapistAvailability.findOneAndUpdate(
      { therapistId: req.user.sub },
      { weeklySchedule, blockedDates, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await TherapistAvailability.findOne({ therapistId: req.user.sub });
    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getClientInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization;

    const consentRes = await axios.get(`${AUTH_SERVICE}/api/auth/internal/consent/${userId}`, {
      headers: { 'X-Internal-Service': 'therapist-service' }
    });

    const consent = consentRes.data.data;
    const result = { consent };

    if (consent.shareAssessmentsWithTherapist) {
      try {
        const assessRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessment/user/${userId}/summary`, {
          headers: { Authorization: token }
        });
        result.assessments = assessRes.data.data;
      } catch (e) {
        result.assessments = null;
      }
    }

    if (consent.shareMoodWithTherapist) {
      try {
        const moodRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessment/user/${userId}/mood`, {
          headers: { Authorization: token }
        });
        result.mood = moodRes.data.data;
      } catch (e) {
        result.mood = null;
      }
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = await Session.countDocuments({
      status: 'completed',
      updatedAt: { $gte: startOfMonth }
    });
    const pendingCount = await Session.countDocuments({ status: 'pending' });

    res.json({ success: true, data: { totalSessions, completedThisMonth, pendingCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
