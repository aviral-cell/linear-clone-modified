import mongoose from 'mongoose';
import { NotFoundError } from '../../utils/appError.js';
import Team from '../../models/Team.js';

const MEMBER_FIELDS = 'name email avatar role createdAt';

const findTeamByIdentifier = async (identifier) => {
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { key: identifier.toUpperCase() };

  const team = await Team.findOne(query).populate('members', MEMBER_FIELDS);
  if (!team) {
    throw new NotFoundError('Team not found');
  }
  return team;
};

export const getAllTeams = async () => {
  return Team.find().populate('members', MEMBER_FIELDS).sort({ name: 1 });
};

export const getTeamByIdentifier = async (identifier) => {
  return findTeamByIdentifier(identifier);
};

export const getTeamMembers = async (identifier) => {
  const team = await findTeamByIdentifier(identifier);
  return team.members;
};
