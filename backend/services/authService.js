import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/auth.js';
import { BadRequestError, UnauthorizedError } from '../utils/appError.js';

export const register = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new BadRequestError('All fields are required');
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    email,
    password: hashedPassword,
    name,
  });

  await user.save();

  const token = generateToken(user._id);

  return { token, user: user.toPublicProfile() };
};

export const login = async (email, password) => {
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await User.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = generateToken(user._id);

  return { token, user: user.toPublicProfile() };
};

export const getCurrentUser = (user) => {
  return user.toPublicProfile();
};
