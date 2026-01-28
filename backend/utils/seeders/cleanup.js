import Project from '../../models/Project.js';
import ProjectUpdate from '../../models/ProjectUpdate.js';
import ProjectActivity from '../../models/ProjectActivity.js';
import Activity from '../../models/Activity.js';
import Comment from '../../models/Comment.js';
import Issue from '../../models/Issue.js';
import Team from '../../models/Team.js';
import User from '../../models/User.js';

/**
 * Drops old indexes that may cause conflicts
 */
export async function dropOldIndexes() {
  console.log('Dropping old indexes...');
  try {
    await Project.collection.dropIndex('key_1');
    console.log('Dropped old key_1 index from projects');
  } catch (error) {
    if (error.code === 27 || error.codeName === 'IndexNotFound') {
      console.log('No key_1 index to drop (already dropped or never existed)');
    } else {
      throw error;
    }
  }
}

/**
 * Clears all existing data from the database
 */
export async function clearAllData() {
  console.log('Flushing all existing data...');
  await Promise.all([
    ProjectUpdate.deleteMany({}),
    ProjectActivity.deleteMany({}),
    Activity.deleteMany({}),
    Comment.deleteMany({}),
    Issue.deleteMany({}),
    Project.deleteMany({}),
    Team.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('All existing data cleared');
}
