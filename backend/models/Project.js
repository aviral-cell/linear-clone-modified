import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'backlog',
        'planned',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['no_priority', 'urgent', 'high', 'medium', 'low'],
      default: 'no_priority',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: null,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

projectSchema.index({ team: 1, status: 1 });
projectSchema.index({ creator: 1, status: 1 });
projectSchema.index({ identifier: 1 });

export default mongoose.model('Project', projectSchema);