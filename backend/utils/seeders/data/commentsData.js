export function getCommentsData(issueId, users) {
  return [
    {
      issue: issueId,
      user: users[0]._id,
      content: 'We should use Socket.io for this. It has great browser support.',
    },
    {
      issue: issueId,
      user: users[2]._id,
      content: 'Agreed! I\'ll start with the basic connection setup.',
    },
    {
      issue: issueId,
      user: users[1]._id,
      content: 'Make sure to handle reconnection logic properly.',
    },
  ];
}
