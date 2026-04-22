const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  presentingIssues: [String],
  sessionSummary: String,
  observations: String,
  interventionsUsed: [String],
  homeworkAssigned: String,
  nextSessionFocus: String,
  riskAssessment: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
