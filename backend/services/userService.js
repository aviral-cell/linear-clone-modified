import User from '../models/User.js';

export const getAllUsers = async () => {
  const users = await User.find().select('-password');
  return users;
};
