import * as teamService from '../services/teamService.js';

export const getAllTeams = async (req, res) => {
  const teams = await teamService.listTeams();
  res.json({ teams });
};

export const getTeamByIdentifier = async (req, res) => {
  const team = await teamService.getTeamByIdentifier(req.params.identifier);
  res.json({ team });
};

export const createTeam = async (req, res) => {
  const team = await teamService.createTeam(req.body);
  res.status(201).json({ team });
};

export const updateTeam = async (req, res) => {
  const team = await teamService.updateTeam(req.params.identifier, req.body);
  res.json({ team });
};

export const deleteTeam = async (req, res) => {
  await teamService.deleteTeam(req.params.identifier);
  res.json({ message: 'Team deleted' });
};

export const getTeamMembers = async (req, res) => {
  const members = await teamService.getTeamMembers(req.params.identifier);
  res.json({ members });
};

export const addTeamMembers = async (req, res) => {
  const team = await teamService.addTeamMembers(req.params.identifier, req.body.userIds);
  res.json({ team });
};

export const removeTeamMember = async (req, res) => {
  const team = await teamService.removeTeamMember(req.params.identifier, req.params.userId);
  res.json({ team });
};
