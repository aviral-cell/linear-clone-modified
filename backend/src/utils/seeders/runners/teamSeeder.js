import Team from '../../../models/Team.js';
import { teamsData } from '../data/teamsData.js';

/**
 * Seeds teams into the database
 * @param {Array} users - Array of user documents to assign as team members
 * @returns {Promise<Array>} Array of inserted team documents
 */
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
