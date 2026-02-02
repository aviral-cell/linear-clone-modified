import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'backlog',
        'todo',
        'in_progress',
        'in_review',
        'done',
        'cancelled',
        'duplicate',
      ],
      default: 'todo',
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
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    labels: [
      {
        type: String,
      },
    ],
    estimate: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'issues',
  }
);

issueSchema.index({ team: 1, status: 1 });
issueSchema.index({ identifier: 1 });
issueSchema.index({ project: 1, status: 1 });

export default mongoose.model('Issue', issueSchema);
