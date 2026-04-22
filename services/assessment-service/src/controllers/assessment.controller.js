const axios = require('axios');
const AssessmentTemplate = require('../models/AssessmentTemplate');
const AssessmentResult = require('../models/AssessmentResult');
const MoodLog = require('../models/MoodLog');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

exports.getTemplates = async (req, res) => {
  try {
    const templates = await AssessmentTemplate.find({ isActive: true })
      .select('type name shortDescription estimatedMinutes');
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTemplateByType = async (req, res) => {
  try {
    const template = await AssessmentTemplate.findOne({ type: req.params.type.toUpperCase(), isActive: true });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Assessment template not found.' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { assessmentType, answers, durationSeconds } = req.body;

    const template = await AssessmentTemplate.findOne({ type: assessmentType, isActive: true });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Assessment template not found.' });
    }

    const totalScore = answers.reduce((sum, a) => sum + a.selectedValue, 0);

    let severity = '', severityColor = '', description = '', recommendations = [];
    for (const range of template.scoring.ranges) {
      if (totalScore >= range.min && totalScore <= range.max) {
        severity = range.severity;
        severityColor = range.color;
        description = range.description;
        recommendations = range.recommendations;
        break;
      }
    }

    const normalSeverities = ['Minimal', 'Good', 'Excellent'];
    const isAbnormal = !normalSeverities.includes(severity);

    const result = await AssessmentResult.create({
      userId: req.user.sub,
      assessmentType,
      answers,
      totalScore,
      severity,
      severityColor,
      recommendations,
      isAbnormal,
      durationSeconds,
      takenAt: new Date()
    });

    res.status(201).json({ success: true, data: { ...result.toObject(), description } });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ userId: req.user.sub })
      .sort({ takenAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getHistoryByType = async (req, res) => {
  try {
    const results = await AssessmentResult.find({
      userId: req.user.sub,
      assessmentType: req.params.type.toUpperCase()
    }).sort({ takenAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getLatestByType = async (req, res) => {
  try {
    const result = await AssessmentResult.findOne({
      userId: req.user.sub,
      assessmentType: req.params.type.toUpperCase()
    }).sort({ takenAt: -1 });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const results = await AssessmentResult.find({
      userId: req.user.sub,
      assessmentType: req.params.type.toUpperCase()
    }).sort({ takenAt: 1 }).select('takenAt totalScore');

    const trends = results.map(r => ({
      date: r.takenAt.toISOString().split('T')[0],
      score: r.totalScore
    }));

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const types = ['PHQ-9', 'GAD-7', 'WELLNESS'];
    const summary = {};

    for (const type of types) {
      const result = await AssessmentResult.findOne({
        userId: req.user.sub,
        assessmentType: type
      }).sort({ takenAt: -1 });
      summary[type] = result || null;
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.sub;
    const insights = [];

    const latestPHQ = await AssessmentResult.findOne({ userId, assessmentType: 'PHQ-9' }).sort({ takenAt: -1 });
    const latestGAD = await AssessmentResult.findOne({ userId, assessmentType: 'GAD-7' }).sort({ takenAt: -1 });

    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now); fourteenDaysAgo.setDate(now.getDate() - 14);

    const last7Moods = await MoodLog.find({
      userId,
      logDate: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
    });
    const prev7Moods = await MoodLog.find({
      userId,
      logDate: { $gte: fourteenDaysAgo.toISOString().split('T')[0], $lt: sevenDaysAgo.toISOString().split('T')[0] }
    });

    const avg7 = last7Moods.length ? last7Moods.reduce((s, m) => s + m.moodScore, 0) / last7Moods.length : null;
    const avgPrev7 = prev7Moods.length ? prev7Moods.reduce((s, m) => s + m.moodScore, 0) / prev7Moods.length : null;

    // Rule 6 (urgent): PHQ-9 >= 15 OR GAD-7 >= 15
    if ((latestPHQ && latestPHQ.totalScore >= 15) || (latestGAD && latestGAD.totalScore >= 15)) {
      insights.push({
        type: 'urgent', icon: 'alert-circle',
        text: 'Your scores suggest you may benefit significantly from professional support. Please consider booking a session.',
        cta: { label: 'Book a Session', path: '/therapists' }
      });
    }

    // Rule 1 (warning): latest PHQ-9 >= 10 AND avg mood last 7d < 5
    if (latestPHQ && latestPHQ.totalScore >= 10 && avg7 !== null && avg7 < 5) {
      insights.push({
        type: 'warning', icon: 'brain',
        text: 'Your mood has been consistently low alongside elevated depression indicators. Consider connecting with a therapist.',
        cta: { label: 'Find a Therapist', path: '/therapists' }
      });
    }

    // Rule 2 (warning): latest GAD-7 >= 10
    if (latestGAD && latestGAD.totalScore >= 10) {
      insights.push({
        type: 'warning', icon: 'activity',
        text: 'Your anxiety levels are elevated. Our therapists specialising in anxiety can help.',
        cta: { label: 'Browse Therapists', path: '/therapists' }
      });
    }

    // Rule 3 (info): no assessment in last 14 days
    const latestAny = await AssessmentResult.findOne({ userId }).sort({ takenAt: -1 });
    if (!latestAny || (now - new Date(latestAny.takenAt)) > 14 * 24 * 60 * 60 * 1000) {
      insights.push({
        type: 'info', icon: 'clipboard',
        text: 'It has been a while since your last check-in. Regular assessments help you track your progress.',
        cta: { label: 'Take an Assessment', path: '/assessments' }
      });
    }

    // Rule 4 (success): avg mood last 7d > avg mood previous 7d
    if (avg7 !== null && avgPrev7 !== null && avg7 > avgPrev7) {
      insights.push({
        type: 'success', icon: 'trending-up',
        text: 'Your mood has been improving over the past week. Keep it up!',
        cta: null
      });
    }

    // Rule 5 (success): mood logged every day last 7 days
    if (last7Moods.length >= 7) {
      insights.push({
        type: 'success', icon: 'star',
        text: '7-day streak! Consistent daily tracking is a powerful wellness habit.',
        cta: null
      });
    }

    const priority = { urgent: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priority[a.type] - priority[b.type]);

    res.json({ success: true, data: insights.slice(0, 3) });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUserSummary = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/consent/${targetUserId}`, {
      headers: { 'X-Internal-Service': 'assessment-service' }
    });

    if (!data.data.shareAssessmentsWithTherapist) {
      return res.status(403).json({ success: false, message: 'User has not consented to share assessment data.' });
    }

    const types = ['PHQ-9', 'GAD-7', 'WELLNESS'];
    const summary = {};
    for (const type of types) {
      const result = await AssessmentResult.findOne({ userId: targetUserId, assessmentType: type }).sort({ takenAt: -1 });
      summary[type] = result || null;
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return res.status(403).json({ success: false, message: 'User has not consented to share data.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getUserMood = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/consent/${targetUserId}`, {
      headers: { 'X-Internal-Service': 'assessment-service' }
    });

    if (!data.data.shareMoodWithTherapist) {
      return res.status(403).json({ success: false, message: 'User has not consented to share mood data.' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const moods = await MoodLog.find({
      userId: targetUserId,
      logDate: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
    }).sort({ logDate: -1 });

    res.json({ success: true, data: moods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
