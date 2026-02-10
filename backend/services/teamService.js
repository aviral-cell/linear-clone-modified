import mongoose from 'mongoose';
import { NotFoundError, BadRequestError } from '../utils/appError.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';

const MEMBER_FIELDS = 'name email avatar role';

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
  return Team.find().populate('members', MEMBER_FIELDS).sort({ createdAt: -1 });
};

export const getTeamByIdentifier = async (identifier) => {
  return findTeamByIdentifier(identifier);
};

export const createTeam = async (data) => {
  const { name, key, icon, description } = data;

  if (!name || !key) {
    throw new BadRequestError('Name and key are required');
  }

  const normalizedKey = key.toUpperCase().trim();

  if (!/^[A-Z0-9]{2,10}$/.test(normalizedKey)) {
    throw new BadRequestError('Key must be 2-10 alphanumeric characters');
  }

  const existing = await Team.findOne({ key: normalizedKey });
  if (existing) {
    throw new BadRequestError('Team key already exists');
  }

  const team = new Team({
    name: name.trim(),
    key: normalizedKey,
    icon: icon || undefined,
    description: description || '',
  });

  await team.save();
  return team;
};

export const updateTeam = async (identifier, updates) => {
  const team = await findTeamByIdentifier(identifier);

  if (updates.key && updates.key.toUpperCase() !== team.key) {
    throw new BadRequestError('Team key cannot be changed');
  }

  if (updates.name !== undefined) team.name = updates.name.trim();
  if (updates.icon !== undefined) team.icon = updates.icon;
  if (updates.description !== undefined) team.description = updates.description;

  await team.save();
  await team.populate('members', MEMBER_FIELDS);
  return team;
};

export const deleteTeam = async (identifier) => {
  const team = await findTeamByIdentifier(identifier);

  const [projectCount, issueCount] = await Promise.all([
    Project.countDocuments({ team: team._id }),
    Issue.countDocuments({ team: team._id }),
  ]);

  if (projectCount > 0 || issueCount > 0) {
    throw new BadRequestError(
      `Cannot delete team with ${projectCount} project(s) and ${issueCount} issue(s). Remove them first.`
    );
  }

  await Team.findByIdAndDelete(team._id);
  return team;
};

export const getTeamMembers = async (identifier) => {
  const team = await findTeamByIdentifier(identifier);
  return team.members;
};

export const addTeamMembers = async (identifier, userIds) => {
  const team = await findTeamByIdentifier(identifier);

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError('userIds must be a non-empty array');
  }

  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    throw new BadRequestError('One or more user IDs are invalid');
  }

  const existingIds = new Set(team.members.map((m) => m._id.toString()));
  const newIds = userIds.filter((id) => !existingIds.has(id.toString()));

  if (newIds.length > 0) {
    await Team.findByIdAndUpdate(team._id, {
      $addToSet: { members: { $each: newIds } },
    });
  }

  return findTeamByIdentifier(identifier);
};

export const removeTeamMember = async (identifier, userId) => {
  const team = await findTeamByIdentifier(identifier);

  const isMember = team.members.some((m) => m._id.toString() === userId.toString());
  if (!isMember) {
    throw new NotFoundError('User is not a member of this team');
  }

  await Team.findByIdAndUpdate(team._id, {
    $pull: { members: userId },
  });

  return findTeamByIdentifier(identifier);
};
