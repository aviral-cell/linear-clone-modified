import Team from '../../../models/Team.js';
import { teamsData } from '../data/teamsData.js';

export async function seedTeams(users) {
  console.log('Seeding teams...');

  const admin = users.find((u) => u.role === 'admin') || users[0];
  const nonAdmins = users.filter((u) => u._id.toString() !== admin._id.toString());
  const insertedTeams = [];

  for (let i = 0; i < teamsData.length; i++) {
    const start = (i * 2) % nonAdmins.length;
    const memberIds = [admin._id];

    for (let j = 0; j < Math.min(4, nonAdmins.length); j++) {
      const idx = (start + j) % nonAdmins.length;
      if (!memberIds.some((id) => id.toString() === nonAdmins[idx]._id.toString())) {
        memberIds.push(nonAdmins[idx]._id);
      }
    }

    const team = new Team({
      ...teamsData[i],
      members: memberIds,
    });
    await team.save();
    insertedTeams.push(team);
  }

  console.log(`✓ Teams seeded successfully (${insertedTeams.length} teams)`);
  return insertedTeams;
}
