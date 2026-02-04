import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    },
    path: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    queryParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    errorStack: {
      type: String,
      default: null,
    },
    isSlow: {
      type: Boolean,
      default: false,
      index: true,
    },
    isError: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'apilogs',
  }
);

// Compound index for common queries
apiLogSchema.index({ isSlow: 1, isError: 1 });
apiLogSchema.index({ timestamp: -1, statusCode: 1 });

export default mongoose.model('ApiLog', apiLogSchema);
