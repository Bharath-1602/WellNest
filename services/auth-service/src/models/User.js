const mongoose = require('mongoose');

const therapistProfileSchema = new mongoose.Schema({
  specializations: [String],
  experienceYears: Number,
  licenseNumber: String,
  bio: String,
  sessionPrice: Number,
  sessionDuration: { type: Number, default: 50 },
  languages: [String],
  approachMethods: [String],
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'therapist', 'admin'], required: true },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  privacySettings: {
    shareAssessmentsWithTherapist: { type: Boolean, default: false },
    shareMoodWithTherapist: { type: Boolean, default: false }
  },
  therapistProfile: therapistProfileSchema
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1, 'therapistProfile.isVerified': 1 });

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
