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
        'updated_status',
        'updated_priority',
        'set_target_date',
        'cleared_target_date',
        'set_start_date',
        'cleared_start_date',
        'updated_lead',
        'cleared_lead',
        'updated_team',
        'updated_members',
        'updated_name',
        'updated_summary',
        'posted_update',
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
