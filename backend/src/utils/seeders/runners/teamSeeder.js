import Team from '../../../models/Team.js';
import { teamsData } from '../data/teamsData.js';

export async function seedTeams(users) {
  console.log('Seeding teams...');
  const insertedTeams = [];

  for (const teamData of teamsData) {
    const team = new Team({
      ...teamData,
      members: users.map((u) => u._id),
    });
    await team.save();
    insertedTeams.push(team);
  }

  console.log(`✓ Teams seeded successfully (${insertedTeams.length} teams)`);
  return insertedTeams;
}
