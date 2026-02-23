import connectDatabase from '../../config/database.js';
import { dropOldIndexes, clearAllData } from './cleanup.js';
import { seedUsers } from './runners/userSeeder.js';
import { seedTeams } from './runners/teamSeeder.js';
import { seedProjects } from './runners/projectSeeder.js';
import { seedProjectUpdates } from './runners/projectUpdateSeeder.js';
import { seedProjectActivities } from './runners/projectActivitySeeder.js';
import { seedIssues } from './runners/issueSeeder.js';
import { seedComments } from './runners/commentSeeder.js';

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
    console.log('Email: alice@workflow.dev');
    console.log('Password: Password@123');
    console.log('=================================\n');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
