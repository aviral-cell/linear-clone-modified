import mongoose from 'mongoose';

const issueActivitySchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'updated_status',
        'updated_priority',
        'updated_assignee',
        'updated_title',
        'updated_description',
        'added_comment',
        'deleted_comment',
        'added_label',
        'removed_label',
        'updated_project',
        'updated_parent',
      ],
    },
    changes: {
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'activities',
  }
);

issueActivitySchema.index({ issue: 1, createdAt: -1 });

export default mongoose.model('IssueActivity', issueActivitySchema);
