import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = await import('bcrypt');
  return bcrypt.default.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);
