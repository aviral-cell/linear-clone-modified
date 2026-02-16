import ProjectActivity from '../../../models/ProjectActivity.js';
import { getProjectActivitiesData } from '../data/projectActivitiesData.js';

/**
 * Seeds project activities into the database
 * @param {Array} projects - Array of project documents
 * @param {Array} users - Array of user documents
 * @param {Array} updates - Array of update documents to interleave activities with
 * @returns {Promise<Array>} Array of inserted project activity documents
 */
export async function seedProjectActivities(projects, users, updates = []) {
  console.log('Seeding project activities...');

  const populatedProjects = await Promise.all(
    projects.map(async (project) => {
      const populated = await project.populate([
        { path: 'lead', select: 'name email' },
        { path: 'members', select: 'name email' },
        { path: 'creator', select: 'name email' },
      ]);
      return populated;
    })
  );

  const activitiesData = getProjectActivitiesData(populatedProjects, users, updates);

  const insertedActivities = [];
  for (const activityData of activitiesData) {
    const activity = new ProjectActivity(activityData);
    await activity.save();
    insertedActivities.push(activity);
  }

  console.log(`✓ Project activities seeded successfully (${insertedActivities.length} activities)`);
  return insertedActivities;
}
