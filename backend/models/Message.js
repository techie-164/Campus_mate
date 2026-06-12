import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: {
      type: String,
      default: 'Anonymous',
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
