import Team from '../models/Team.js';

export const getAllTeams = async (req, res) => {
  const teams = await Team.find().populate('members', 'name email avatar');
  res.json({ teams });
};
