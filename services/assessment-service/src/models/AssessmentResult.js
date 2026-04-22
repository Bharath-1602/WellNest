const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  assessmentType: { type: String, required: true, enum: ['PHQ-9', 'GAD-7', 'WELLNESS'] },
  answers: [{
    questionNumber: Number,
    selectedValue: Number
  }],
  totalScore: { type: Number, required: true },
  severity: String,
  severityColor: String,
  recommendations: [String],
  isAbnormal: { type: Boolean, default: false },
  durationSeconds: Number,
  takenAt: { type: Date, default: Date.now }
});

assessmentResultSchema.index({ userId: 1, assessmentType: 1, takenAt: -1 });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
