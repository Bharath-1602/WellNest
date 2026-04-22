const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  isAvailable: { type: Boolean, default: false },
  timeSlots: [String]
}, { _id: false });

const therapistAvailabilitySchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  weeklySchedule: {
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
    sunday: daySchema
  },
  blockedDates: [String],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TherapistAvailability', therapistAvailabilitySchema);
