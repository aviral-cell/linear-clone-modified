import * as teamService from '../services/team/teamService.js';

export const getAllTeams = async (req, res) => {
  const teams = await teamService.getAllTeams();
  res.json({ teams });
};
