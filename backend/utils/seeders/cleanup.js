import Project from '../../models/Project.js';
import ProjectUpdate from '../../models/ProjectUpdate.js';
import Activity from '../../models/Activity.js';
import Comment from '../../models/Comment.js';
import Issue from '../../models/Issue.js';
import Team from '../../models/Team.js';
import User from '../../models/User.js';


/**
 * Clears all existing data from the database
 */
export async function clearAllData() {
  console.log('Flushing all existing data...');
  await Promise.all([
    ProjectUpdate.deleteMany({}),
    Activity.deleteMany({}),
    Comment.deleteMany({}),
    Issue.deleteMany({}),
    Project.deleteMany({}),
    Team.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('All existing data cleared');
}
