import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.register(email, password, name);
  res.status(201).json({ message: 'User registered successfully', ...result });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ message: 'Login successful', ...result });
};

export const getCurrentUser = async (req, res) => {
  const user = authService.getCurrentUser(req.user);
  res.json({ user });
};
