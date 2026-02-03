import connectDatabase from '../../config/database.js';
import { dropOldIndexes, clearAllData } from './cleanup.js';
import { seedUsers } from './seeders/userSeeder.js';
import { seedTeams } from './seeders/teamSeeder.js';
import { seedProjects } from './seeders/projectSeeder.js';
import { seedProjectUpdates } from './seeders/projectUpdateSeeder.js';
import { seedProjectActivities } from './seeders/projectActivitySeeder.js';
import { seedIssues } from './seeders/issueSeeder.js';
import { seedComments } from './seeders/commentSeeder.js';

/**
 * Main seeder function that orchestrates the entire seeding process
 */
export async function seed() {
  console.log('========= SEEDING DATA ==========');
  try {
    await connectDatabase();
    console.log('✓ Connected to the database\n');

    await clearAllData();
    console.log('');

    const users = await seedUsers();
    console.log('');

    const teams = await seedTeams(users);
    console.log('');

    const projects = await seedProjects(teams, users, users[0]);
    console.log('');

    const { updates } = await seedProjectUpdates(projects, users, teams);
    console.log('');

    await seedProjectActivities(projects, users, updates);
    console.log('');

    const issues = await seedIssues(teams, users, projects, users[0]);
    console.log('');

    await seedComments(issues, users);
    console.log('');

    console.log('=================================');
    console.log('Data seeding completed successfully!');
    console.log('=================================');
    console.log('\nLogin credentials:');
    console.log('Email: alex@workflow.dev');
    console.log('Password: Password@123');
    console.log('=================================\n');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
