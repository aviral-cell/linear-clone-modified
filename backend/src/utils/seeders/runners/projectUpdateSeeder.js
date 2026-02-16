import ProjectUpdate from '../../../models/ProjectUpdate.js';
import ProjectActivity from '../../../models/ProjectActivity.js';
import { getProjectUpdatesData } from '../data/projectUpdatesData.js';

/**
 * Seeds project updates into the database
 * @param {Array} projects - Array of project documents
 * @param {Array} users - Array of user documents
 * @param {Array} teams - Array of team documents
 * @returns {Promise<Object>} Object containing inserted updates and update activities
 */
export async function seedProjectUpdates(projects, users, teams) {
  console.log('Seeding project updates...');
  const { updates, updateActivities } = getProjectUpdatesData(projects, users, teams);

  const insertedUpdates = [];
  for (const updateData of updates) {
    const update = new ProjectUpdate(updateData);
    await update.save();
    insertedUpdates.push(update);
  }

  const insertedUpdateActivities = [];
  for (const activityData of updateActivities) {
    const activity = new ProjectActivity(activityData);
    await activity.save();
    insertedUpdateActivities.push(activity);
  }

  console.log(
    `✓ Project updates seeded successfully (${insertedUpdates.length} updates, ${insertedUpdateActivities.length} update activities)`
  );
  return { updates: insertedUpdates, updateActivities: insertedUpdateActivities };
}
