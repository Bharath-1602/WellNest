const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  value: Number,
  label: String
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionNumber: Number,
  questionText: String,
  options: [optionSchema]
}, { _id: false });

const rangeSchema = new mongoose.Schema({
  min: Number,
  max: Number,
  severity: String,
  color: String,
  description: String,
  recommendations: [String]
}, { _id: false });

const assessmentTemplateSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true, enum: ['PHQ-9', 'GAD-7', 'WELLNESS'] },
  name: { type: String, required: true },
  shortDescription: String,
  estimatedMinutes: Number,
  questions: [questionSchema],
  scoring: {
    maxScore: Number,
    ranges: [rangeSchema]
  },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('AssessmentTemplate', assessmentTemplateSchema);
