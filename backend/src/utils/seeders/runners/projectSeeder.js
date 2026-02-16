import Project from '../../../models/Project.js';
import { generateProjectIdentifier } from '../../projectUtils.js';
import { getProjectsData } from '../data/projectsData.js';

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
