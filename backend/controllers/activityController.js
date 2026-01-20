import Activity from '../models/Activity.js';

export const getActivitiesByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const activities = await Activity.find({ issue: issueId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1, _id: -1 });

    res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
