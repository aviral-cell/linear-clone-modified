import Project from '../../../models/Project.js';
import { generateProjectIdentifier } from '../../projectUtils.js';

/**
 * Seeds projects into the database
 * @param {Array} teams - Array of team documents
 * @param {Object} creator - User document to set as creator
 * @returns {Promise<Array>} Array of inserted project documents
 */
export async function seedProjects(teams, creator) {
  console.log('Seeding projects...');
  const insertedProjects = [];

  for (const team of teams) {
    const projectDefinitions = [
      {
        name: `${team.name} Core Improvements`,
        status: 'in_progress',
      },
      {
        name: `${team.name} Roadmap`,
        status: 'planned',
      },
    ];

    for (const def of projectDefinitions) {
      const project = new Project({
        name: def.name,
        identifier: generateProjectIdentifier(def.name),
        description: `${def.name} initiative for ${team.name}.`,
        status: def.status,
        team: team._id,
        creator: creator._id,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      await project.save();
      insertedProjects.push(project);
    }
  }

  console.log(`✓ Projects seeded successfully (${insertedProjects.length} projects)`);
  return insertedProjects;
}
