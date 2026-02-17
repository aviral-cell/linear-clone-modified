import * as teamService from '../services/teamService.js';

export const getAllTeams = async (req, res) => {
  const teams = await teamService.listTeams();
  res.json({ teams });
};

export const getTeamByIdentifier = async (req, res) => {
  const team = await teamService.getTeamByIdentifier(req.params.identifier);
  res.json({ team });
};

export const getTeamMembers = async (req, res) => {
  const members = await teamService.getTeamMembers(req.params.identifier);
  res.json({ members });
};
