import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ownerName: {
      type: String,
      default: 'Anonymous',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    materials: [
      {
        title: {
          type: String,
          required: true,
        },
        desc: {
          type: String,
          default: '',
        },
        fileName: String,
        fileType: String,
        fileSize: Number,
        fileData: String,
        createdBy: {
          type: String,
          default: 'Anonymous',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
