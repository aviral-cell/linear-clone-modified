import Team from '../models/Team.js';

export const getAllTeams = async () => {
  const teams = await Team.find().populate('members', 'name email avatar');
  return teams;
};
