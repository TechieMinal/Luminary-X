const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool', 'other'],
      default: 'technical',
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    endorsements: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ user: 1 });
skillSchema.index({ name: 1 });

module.exports = mongoose.model('Skill', skillSchema);
