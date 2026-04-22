const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userName: String,
  therapistId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  therapistName: String,
  scheduledDate: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 50 },
  mode: { type: String, enum: ['video', 'audio', 'chat', 'in-person'], default: 'video' },
  sessionFee: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  userNotes: String,
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['user', 'therapist', 'admin'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

sessionSchema.index({ therapistId: 1, scheduledDate: 1, scheduledTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);
