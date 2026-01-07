import Team from '../models/Team.js';

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email avatar');
    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
