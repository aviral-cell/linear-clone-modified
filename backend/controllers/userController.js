import * as userService from '../services/userService.js';

export const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ users });
};
