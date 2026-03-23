const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },
    currentRole: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    linkedIn: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    availableSlots: {
      type: Number,
      default: 3,
      min: 0,
      max: 20,
    },
    sessionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalSessions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

mentorProfileSchema.index({ user: 1 });
mentorProfileSchema.index({ expertise: 1 });

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
