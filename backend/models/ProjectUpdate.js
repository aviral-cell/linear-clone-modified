import mongoose from 'mongoose';

const projectUpdateSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['on_track', 'at_risk', 'off_track'],
      required: true,
      nullable: false
    },
  },
  {
    timestamps: true,
    collection: 'projectupdates',
  }
);

projectUpdateSchema.index({ project: 1, createdAt: -1 });
projectUpdateSchema.index({ author: 1 });

export default mongoose.model('ProjectUpdate', projectUpdateSchema);

