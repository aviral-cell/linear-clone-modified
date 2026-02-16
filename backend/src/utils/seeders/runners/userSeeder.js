import User from '../../../models/User.js';
import { getUsersData } from '../data/usersData.js';

export async function seedUsers() {
  console.log('Seeding users...');
  const usersData = await getUsersData();
  const insertedUsers = await User.insertMany(usersData);
  console.log(`✓ Users seeded successfully (${insertedUsers.length} users)`);
  return insertedUsers;
}
