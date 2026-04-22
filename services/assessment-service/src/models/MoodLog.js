const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  logDate: { type: String, required: true },
  moodScore: { type: Number, required: true, min: 1, max: 10 },
  moodEmoji: String,
  emotions: [{ type: String, enum: ['anxious', 'hopeful', 'stressed', 'calm', 'grateful', 'sad', 'angry', 'excited', 'lonely', 'content', 'overwhelmed', 'peaceful'] }],
  activities: [{ type: String, enum: ['exercise', 'meditation', 'reading', 'social', 'work', 'therapy', 'nature-walk', 'creative', 'family-time', 'self-care'] }],
  sleepHours: { type: Number, min: 0, max: 24 },
  journalNote: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

moodLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);
