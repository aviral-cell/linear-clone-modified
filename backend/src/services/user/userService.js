import User from '../../models/User.js';
import Team from '../../models/Team.js';

export const getAllUsers = async () => {
  const [users, teamCounts] = await Promise.all([
    User.find().select('-password'),
    Team.aggregate([{ $unwind: '$members' }, { $group: { _id: '$members', count: { $sum: 1 } } }]),
  ]);

  const teamCountMap = Object.fromEntries(
    teamCounts.map((entry) => [entry._id.toString(), entry.count])
  );

  return users.map((user) => ({
    ...user.toObject(),
    teamCount: teamCountMap[user._id.toString()] || 0,
  }));
};
