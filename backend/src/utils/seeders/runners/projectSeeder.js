import Project from '../../../models/Project.js';
import { generateProjectIdentifier } from '../../projectUtils.js';
import { getProjectsData } from '../data/projectsData.js';

/**
 * Seeds projects into the database
 * @param {Array} teams - Array of team documents
 * @param {Array} users - Array of user documents
 * @param {Object} creator - User document to set as creator
 * @returns {Promise<Array>} Array of inserted project documents
 */
export async function seedProjects(teams, users, creator) {
  console.log('Seeding projects...');
  const projectsData = getProjectsData(teams, users, creator);
  const insertedProjects = [];

  for (const projectData of projectsData) {
    const project = new Project({
      ...projectData,
      identifier: generateProjectIdentifier(projectData.name),
    });
    await project.save();
    insertedProjects.push(project);
  }

  console.log(`✓ Projects seeded successfully (${insertedProjects.length} projects)`);
  return insertedProjects;
}
