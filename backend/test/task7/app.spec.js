import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Team from '../../src/models/Team.js';
import Issue from '../../src/models/Issue.js';
import Comment from '../../src/models/Comment.js';
import IssueActivity from '../../src/models/IssueActivity.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue, Comment, IssueActivity]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Task 7: Delete Issue Testing', function () {
  this.timeout(15000);

  let user;
  let token;
  let team;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();

    const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
    if (dbName && !dbName.includes('test')) {
      throw new Error(`Not connected to test database! Connected to: ${dbName}`);
    }

    await cleanupModels();

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('password123', 12);

    user = new User({
      email: 'deleteuser@test.com',
      password: hashedPassword,
      name: 'Delete Test User',
    });
    await user.save();
    token = generateToken(user._id);

    team = new Team({
      name: 'Delete Team',
      key: 'DEL',
      members: [user._id],
    });
    await team.save();
  });

  beforeEach(async () => {
    await Issue.deleteMany({});
    await Comment.deleteMany({});
    await IssueActivity.deleteMany({});
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  // --- Standalone Delete ---

  it('should delete a standalone issue and return deletedCount of 1', async () => {
    const issue = new Issue({
      identifier: 'DEL-1',
      title: 'Standalone Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await issue.save();

    const res = await chai
      .request(app)
      .delete(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.message).to.match(/issue deleted/i);
    expect(res.body).to.have.property('deletedCount', 1);

    const found = await Issue.findOne({ identifier: 'DEL-1' });
    expect(found).to.be.null;
  });

  // --- Cascade Delete ---

  it('should cascade delete sub-issues when parent is deleted', async () => {
    const parent = new Issue({
      identifier: 'DEL-2',
      title: 'Parent Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await parent.save();

    const child = new Issue({
      identifier: 'DEL-3',
      title: 'Child Issue',
      status: 'todo',
      priority: 'medium',
      team: team._id,
      creator: user._id,
      parent: parent._id,
    });
    await child.save();

    const grandchild = new Issue({
      identifier: 'DEL-4',
      title: 'Grandchild Issue',
      status: 'todo',
      priority: 'low',
      team: team._id,
      creator: user._id,
      parent: child._id,
    });
    await grandchild.save();

    const res = await chai
      .request(app)
      .delete(`/api/issues/${parent.identifier}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('deletedCount', 3);

    const remaining = await Issue.find({
      identifier: { $in: ['DEL-2', 'DEL-3', 'DEL-4'] },
    });
    expect(remaining).to.have.lengthOf(0);
  });

  it('should cascade delete comments and activities for the issue and its descendants', async () => {
    const parent = new Issue({
      identifier: 'DEL-5',
      title: 'Parent With Data',
      status: 'in_progress',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await parent.save();

    const child = new Issue({
      identifier: 'DEL-6',
      title: 'Child With Data',
      status: 'todo',
      priority: 'medium',
      team: team._id,
      creator: user._id,
      parent: parent._id,
    });
    await child.save();

    await Comment.create([
      { issue: parent._id, user: user._id, content: 'Parent comment' },
      { issue: child._id, user: user._id, content: 'Child comment' },
    ]);

    await IssueActivity.create([
      { issue: parent._id, user: user._id, action: 'created' },
      { issue: child._id, user: user._id, action: 'created' },
    ]);

    const res = await chai
      .request(app)
      .delete(`/api/issues/${parent.identifier}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('deletedCount', 2);

    const remainingComments = await Comment.find({
      issue: { $in: [parent._id, child._id] },
    });
    expect(remainingComments).to.have.lengthOf(0);

    const remainingActivities = await IssueActivity.find({
      issue: { $in: [parent._id, child._id] },
    });
    expect(remainingActivities).to.have.lengthOf(0);
  });

  it('should not delete unrelated issues when deleting a specific issue', async () => {
    const target = new Issue({
      identifier: 'DEL-7',
      title: 'Target Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await target.save();

    const unrelated = new Issue({
      identifier: 'DEL-8',
      title: 'Unrelated Issue',
      status: 'todo',
      priority: 'medium',
      team: team._id,
      creator: user._id,
    });
    await unrelated.save();

    await chai
      .request(app)
      .delete(`/api/issues/${target.identifier}`)
      .set('Authorization', `Bearer ${token}`);

    const found = await Issue.findOne({ identifier: 'DEL-8' });
    expect(found).to.not.be.null;
    expect(found.title).to.equal('Unrelated Issue');
  });

  // --- Error Handling ---

  it('should return 404 when deleting a non-existent issue', async () => {
    const res = await chai
      .request(app)
      .delete('/api/issues/NONEXISTENT-999')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(404);
    expect(res.body.message).to.match(/not found/i);
  });

  it('should return 401 when deleting without authentication', async () => {
    const issue = new Issue({
      identifier: 'DEL-9',
      title: 'Auth Test Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await issue.save();

    const res = await chai.request(app).delete(`/api/issues/${issue.identifier}`);

    expect(res).to.have.status(401);

    const found = await Issue.findOne({ identifier: 'DEL-9' });
    expect(found).to.not.be.null;
  });

  // --- Selective Delete ---

  it('should only delete the child sub-issue when targeting it, not the parent', async () => {
    const parent = new Issue({
      identifier: 'DEL-10',
      title: 'Parent Stays',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: user._id,
    });
    await parent.save();

    const child = new Issue({
      identifier: 'DEL-11',
      title: 'Child Gets Deleted',
      status: 'todo',
      priority: 'medium',
      team: team._id,
      creator: user._id,
      parent: parent._id,
    });
    await child.save();

    const res = await chai
      .request(app)
      .delete(`/api/issues/${child.identifier}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('deletedCount', 1);

    const parentFound = await Issue.findOne({ identifier: 'DEL-10' });
    expect(parentFound).to.not.be.null;

    const childFound = await Issue.findOne({ identifier: 'DEL-11' });
    expect(childFound).to.be.null;
  });
});
