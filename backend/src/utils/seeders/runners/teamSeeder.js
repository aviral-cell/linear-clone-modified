import Team from '../../../models/Team.js';
import { teamsData } from '../data/teamsData.js';

export async function seedTeams(users) {
  console.log('Seeding teams...');

  const admin = users.find((u) => u.role === 'admin') || users[0];
  const nonAdmins = users.filter((u) => u._id.toString() !== admin._id.toString());
  const membersPerTeam = Math.ceil(nonAdmins.length / teamsData.length);
  const insertedTeams = [];

  for (let i = 0; i < teamsData.length; i++) {
    const start = i * membersPerTeam;
    const slice = nonAdmins.slice(start, start + membersPerTeam);
    const memberIds = [admin._id, ...slice.map((u) => u._id)];

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
