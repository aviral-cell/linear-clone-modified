import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { BadRequestError, UnauthorizedError } from '../utils/AppError.js';

export const register = async (req, res) => {
  const { email, password, name } = req.body;

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

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: user.toPublicProfile(),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

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

  res.json({
    message: 'Login successful',
    token,
    user: user.toPublicProfile(),
  });
};

export const getCurrentUser = async (req, res) => {
  res.json({ user: req.user.toPublicProfile() });
};
