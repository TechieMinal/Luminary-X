const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 240,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    rating: {
      score: { type: Number, min: 1, max: 5, default: null },
      review: { type: String, maxlength: 500, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

sessionSchema.index({ mentor: 1 });
sessionSchema.index({ student: 1 });
sessionSchema.index({ scheduledAt: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
