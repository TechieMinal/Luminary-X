const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'paused'],
      default: 'in-progress',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ techStack: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
