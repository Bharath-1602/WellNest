const MoodLog = require('../models/MoodLog');

const getEmoji = (score) => {
  if (score <= 2) return '😔';
  if (score <= 4) return '😕';
  if (score <= 6) return '😐';
  if (score <= 8) return '🙂';
  return '😊';
};

const getToday = () => new Date().toISOString().split('T')[0];

exports.logMood = async (req, res) => {
  try {
    const { moodScore, emotions, activities, sleepHours, journalNote } = req.body;
    const logDate = getToday();
    const moodEmoji = getEmoji(moodScore);

    const existing = await MoodLog.findOne({ userId: req.user.sub, logDate });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Mood already logged today. Use PATCH to update.' });
    }

    const mood = await MoodLog.create({
      userId: req.user.sub,
      logDate,
      moodScore,
      moodEmoji,
      emotions: emotions || [],
      activities: activities || [],
      sleepHours,
      journalNote
    });

    res.status(201).json({ success: true, data: mood });
  } catch (error) {
    console.error('Log mood error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateTodayMood = async (req, res) => {
  try {
    const logDate = getToday();
    const mood = await MoodLog.findOne({ userId: req.user.sub, logDate });

    if (!mood) {
      return res.status(404).json({ success: false, message: 'No mood logged today.' });
    }

    const { moodScore, emotions, activities, sleepHours, journalNote } = req.body;

    if (moodScore !== undefined) {
      mood.moodScore = moodScore;
      mood.moodEmoji = getEmoji(moodScore);
    }
    if (emotions !== undefined) mood.emotions = emotions;
    if (activities !== undefined) mood.activities = activities;
    if (sleepHours !== undefined) mood.sleepHours = sleepHours;
    if (journalNote !== undefined) mood.journalNote = journalNote;

    await mood.save();
    res.json({ success: true, data: mood });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getTodayMood = async (req, res) => {
  try {
    const mood = await MoodLog.findOne({ userId: req.user.sub, logDate: getToday() });
    res.json({ success: true, data: mood });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getWeekMood = async (req, res) => {
  try {
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const mood = await MoodLog.findOne({ userId: req.user.sub, logDate: dateStr });
      result.push(mood ? { date: dateStr, moodScore: mood.moodScore, moodEmoji: mood.moodEmoji } : { date: dateStr, moodScore: null, moodEmoji: null });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getMonthMood = async (req, res) => {
  try {
    const today = new Date();
    const result = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const mood = await MoodLog.findOne({ userId: req.user.sub, logDate: dateStr });
      result.push(mood ? { date: dateStr, moodScore: mood.moodScore } : { date: dateStr, moodScore: null });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
