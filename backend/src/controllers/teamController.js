import * as teamService from '../services/team/teamService.js';

export const getAllTeams = async (req, res) => {
  const teams = await teamService.getAllTeams();
  res.json({ teams });
};

export const getTeamByIdentifier = async (req, res) => {
  const identifier = req.params.identifier
  const team = await teamService.getTeamByIdentifier(identifier);
  res.json({ team });
};

export const getTeamMembers = async (req, res) => {
  const identifier = req.params.identifier
  const members = await teamService.getTeamMembers(identifier);
  res.json({ members });
};
