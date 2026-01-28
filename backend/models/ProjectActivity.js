import mongoose from 'mongoose';

const projectActivitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'status_changed',
        'priority_changed',
        'target_date_set',
        'target_date_cleared',
        'start_date_set',
        'start_date_cleared',
        'lead_changed',
        'lead_cleared',
        'team_changed',
        'members_changed',
        'name_changed',
        'summary_changed',
        'update_posted',
      ],
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'projectactivities',
  }
);

projectActivitySchema.index({ project: 1, createdAt: -1 });
projectActivitySchema.index({ user: 1 });

export default mongoose.model('ProjectActivity', projectActivitySchema);
