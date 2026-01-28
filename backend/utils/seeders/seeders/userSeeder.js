import User from '../../../models/User.js';
import { getUsersData } from '../data/usersData.js';

/**
 * Seeds users into the database
 * @returns {Promise<Array>} Array of inserted user documents
 */
export async function seedUsers() {
  console.log('Seeding users...');
  const usersData = await getUsersData();
  const insertedUsers = await User.insertMany(usersData);
  console.log(`✓ Users seeded successfully (${insertedUsers.length} users)`);
  return insertedUsers;
}
