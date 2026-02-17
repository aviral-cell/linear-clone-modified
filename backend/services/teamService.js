import mongoose from 'mongoose';
import { NotFoundError } from '../utils/appError.js';
import Team from '../models/Team.js';
import Issue from '../models/Issue.js';

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

export const listTeams = async () => {
  const [teams, issueCounts] = await Promise.all([
    Team.find().populate('members', MEMBER_FIELDS).sort({ createdAt: -1 }),
    Issue.aggregate([{ $group: { _id: '$team', count: { $sum: 1 } } }]),
  ]);

  const issueCountMap = Object.fromEntries(
    issueCounts.map((entry) => [entry._id.toString(), entry.count])
  );

  return teams.map((team) => ({
    ...team.toObject(),
    issueCount: issueCountMap[team._id.toString()] || 0,
  }));
};

export const getTeamByIdentifier = async (identifier) => {
  return findTeamByIdentifier(identifier);
};

export const getTeamMembers = async (identifier) => {
  const team = await findTeamByIdentifier(identifier);
  return team.members;
};
