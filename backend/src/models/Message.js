const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

messageSchema.pre('save', function (next) {
  const ids = [this.sender.toString(), this.receiver.toString()].sort();
  this.conversationId = ids.join('_');
  next();
});

module.exports = mongoose.model('Message', messageSchema);
