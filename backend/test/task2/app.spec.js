import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Team from '../../src/models/Team.js';
import Issue from '../../src/models/Issue.js';
import IssueActivity from '../../src/models/IssueActivity.js';
import Project from '../../src/models/Project.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue, IssueActivity, Project]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Task 2: Issue Activity Tracker Testing', function () {
  this.timeout(10000);

  let user;
  let userToken;
  let team;
  let issue;
  let project;
  let parentIssue;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();

    const dbName = mongoose.connection.db?.databaseName;
    if (dbName && !dbName.includes('test')) {
      throw new Error(`Not connected to test database! Connected to: ${dbName}`);
    }

    await cleanupModels();

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('password123', 12);

    user = new User({
      email: 'testuser@test.com',
      password: hashedPassword,
      name: 'Test User',
    });
    await user.save();
    userToken = generateToken(user._id);

    team = new Team({
      name: 'Test Team',
      key: 'TEST',
      members: [user._id],
    });
    await team.save();

    issue = new Issue({
      identifier: 'TEST-1',
      title: 'Test Issue',
      description: 'Test Description',
      team: team._id,
      creator: user._id,
      status: 'todo',
      priority: 'no_priority',
      assignee: null,
    });
    await issue.save();

    project = new Project({
      name: 'Test Project',
      identifier: 'TP',
      team: team._id,
      creator: user._id,
      lead: user._id,
      status: 'planned',
    });
    await project.save();

    parentIssue = new Issue({
      identifier: 'TEST-2',
      title: 'Parent Issue',
      description: 'Parent Description',
      team: team._id,
      creator: user._id,
      status: 'todo',
    });
    await parentIssue.save();
  });

  afterEach(async () => {
    await IssueActivity.deleteMany({});
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  // --- Update Field Activities ---

  it('should create activities with action "updated_title" and "updated_description" when issue title and description are updated', async () => {
    await Issue.findByIdAndUpdate(issue._id, {
      title: 'Original Title',
      description: 'Original Description',
    });
    issue = await Issue.findById(issue._id);

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated Title', description: 'Updated Description' });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('title', 'Updated Title');
    expect(res.body.issue).to.have.property('description', 'Updated Description');

    const activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(2);

    const titleActivity = activities.find((a) => a.action === 'updated_title');
    expect(titleActivity).to.exist;
    expect(titleActivity).to.have.property('changes');
    expect(titleActivity.changes).to.have.property('field', 'title');
    expect(titleActivity.changes).to.have.property('oldValue', 'Original Title');
    expect(titleActivity.changes).to.have.property('newValue', 'Updated Title');
    expect(titleActivity).to.have.property('user');
    expect(titleActivity.user.toString()).to.equal(user._id.toString());

    const descriptionActivity = activities.find((a) => a.action === 'updated_description');
    expect(descriptionActivity).to.exist;
    expect(descriptionActivity).to.have.property('changes');
    expect(descriptionActivity.changes).to.have.property('field', 'description');
    expect(descriptionActivity.changes).to.have.property('oldValue', 'Original Description');
    expect(descriptionActivity.changes).to.have.property('newValue', 'Updated Description');
    expect(descriptionActivity).to.have.property('user');
    expect(descriptionActivity.user.toString()).to.equal(user._id.toString());
  });

  it('should create an activity with action "updated_status" when issue status is updated', async () => {
    await Issue.findByIdAndUpdate(issue._id, { status: 'todo' });
    issue = await Issue.findById(issue._id);

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('status', 'in_progress');

    const activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_status');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'status');
    expect(activities[0].changes).to.have.property('oldValue', 'todo');
    expect(activities[0].changes).to.have.property('newValue', 'in_progress');
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());
  });

  it('should create an activity with action "updated_priority" when issue priority is updated', async () => {
    await Issue.findByIdAndUpdate(issue._id, { priority: 'no_priority' });
    issue = await Issue.findById(issue._id);

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ priority: 'high' });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('priority', 'high');

    const activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_priority');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'priority');
    expect(activities[0].changes).to.have.property('oldValue', 'no_priority');
    expect(activities[0].changes).to.have.property('newValue', 'high');
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());
  });

  it('should create an activity with action "updated_assignee" when issue assignee is updated', async () => {
    await Issue.findByIdAndUpdate(issue._id, { assignee: null });
    issue = await Issue.findById(issue._id);

    const res1 = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ assignee: user._id.toString() });

    expect(res1).to.have.status(200);
    expect(res1.body).to.have.property('issue');
    expect(res1.body.issue.assignee).to.exist;
    expect(res1.body.issue.assignee._id.toString()).to.equal(user._id.toString());

    let activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_assignee');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'assignee');
    expect(activities[0].changes).to.have.property('oldValue', null);
    expect(activities[0].changes.newValue.toString()).to.equal(user._id.toString());
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());

    issue = await Issue.findById(issue._id);
    expect(issue.assignee.toString()).to.equal(user._id.toString());

    const res2 = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ assignee: null });

    expect(res2).to.have.status(200);
    expect(res2.body).to.have.property('issue');
    expect(res2.body.issue.assignee).to.be.null;

    activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(2);
    expect(activities[0]).to.have.property('action', 'updated_assignee');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'assignee');
    expect(activities[0].changes.oldValue.toString()).to.equal(user._id.toString());
    expect(activities[0].changes).to.have.property('newValue', null);
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());
  });

  it('should create activities with action "updated_project" and "updated_parent" when issue project and parent are updated', async () => {
    await Issue.findByIdAndUpdate(issue._id, { project: null, parent: null });
    issue = await Issue.findById(issue._id);

    const res1 = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projectId: project._id.toString(), parent: parentIssue._id.toString() });

    expect(res1).to.have.status(200);
    expect(res1.body).to.have.property('issue');

    let activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(2);

    const projectActivity = activities.find((a) => a.action === 'updated_project');
    expect(projectActivity).to.exist;
    expect(projectActivity).to.have.property('changes');
    expect(projectActivity.changes).to.have.property('field', 'project');
    expect(projectActivity.changes).to.have.property('oldValue', null);
    expect(projectActivity.changes.newValue.toString()).to.equal(project._id.toString());
    expect(projectActivity).to.have.property('user');
    expect(projectActivity.user.toString()).to.equal(user._id.toString());

    const parentActivity = activities.find((a) => a.action === 'updated_parent');
    expect(parentActivity).to.exist;
    expect(parentActivity).to.have.property('changes');
    expect(parentActivity.changes).to.have.property('field', 'parent');
    expect(parentActivity.changes).to.have.property('oldValue', null);
    expect(parentActivity.changes.newValue.toString()).to.equal(parentIssue._id.toString());
    expect(parentActivity).to.have.property('user');
    expect(parentActivity.user.toString()).to.equal(user._id.toString());

    issue = await Issue.findById(issue._id);

    const res2 = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ projectId: null, parent: null });

    expect(res2).to.have.status(200);

    activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(4);

    const removeProjectActivity = activities.find(
      (a) => a.action === 'updated_project' && a.changes.newValue === null
    );
    expect(removeProjectActivity).to.exist;
    expect(removeProjectActivity.changes).to.have.property('field', 'project');
    expect(removeProjectActivity.changes.oldValue.toString()).to.equal(project._id.toString());
    expect(removeProjectActivity.changes).to.have.property('newValue', null);

    const removeParentActivity = activities.find(
      (a) => a.action === 'updated_parent' && a.changes.newValue === null
    );
    expect(removeParentActivity).to.exist;
    expect(removeParentActivity.changes).to.have.property('field', 'parent');
    expect(removeParentActivity.changes.oldValue.toString()).to.equal(parentIssue._id.toString());
    expect(removeParentActivity.changes).to.have.property('newValue', null);
  });

  // --- Multiple Field Updates ---

  it('should create multiple activities when multiple fields are updated simultaneously', async () => {
    await Issue.findByIdAndUpdate(issue._id, {
      title: 'Original Title',
      description: 'Original Description',
      status: 'todo',
      priority: 'no_priority',
      project: null,
      parent: null,
    });
    issue = await Issue.findById(issue._id);

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'in_progress',
        priority: 'high',
        title: 'Updated Title',
        projectId: project._id.toString(),
        parent: parentIssue._id.toString(),
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('status', 'in_progress');
    expect(res.body.issue).to.have.property('priority', 'high');
    expect(res.body.issue).to.have.property('title', 'Updated Title');

    const activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(5);

    const actionTypes = activities.map((a) => a.action);
    expect(actionTypes).to.include.members([
      'updated_status',
      'updated_priority',
      'updated_title',
      'updated_project',
      'updated_parent',
    ]);
    expect(actionTypes.length).to.equal(5);

    const statusActivity = activities.find((a) => a.action === 'updated_status');
    expect(statusActivity).to.exist;
    expect(statusActivity.changes).to.have.property('field', 'status');
    expect(statusActivity.changes).to.have.property('oldValue', 'todo');
    expect(statusActivity.changes).to.have.property('newValue', 'in_progress');

    const priorityActivity = activities.find((a) => a.action === 'updated_priority');
    expect(priorityActivity).to.exist;
    expect(priorityActivity.changes).to.have.property('field', 'priority');
    expect(priorityActivity.changes).to.have.property('oldValue', 'no_priority');
    expect(priorityActivity.changes).to.have.property('newValue', 'high');

    const titleActivity = activities.find((a) => a.action === 'updated_title');
    expect(titleActivity).to.exist;
    expect(titleActivity.changes).to.have.property('field', 'title');
    expect(titleActivity.changes).to.have.property('oldValue', 'Original Title');
    expect(titleActivity.changes).to.have.property('newValue', 'Updated Title');

    const projectActivity = activities.find((a) => a.action === 'updated_project');
    expect(projectActivity).to.exist;
    expect(projectActivity.changes).to.have.property('field', 'project');
    expect(projectActivity.changes).to.have.property('oldValue', null);
    expect(projectActivity.changes.newValue.toString()).to.equal(project._id.toString());

    const parentActivity = activities.find((a) => a.action === 'updated_parent');
    expect(parentActivity).to.exist;
    expect(parentActivity.changes).to.have.property('field', 'parent');
    expect(parentActivity.changes).to.have.property('oldValue', null);
    expect(parentActivity.changes.newValue.toString()).to.equal(parentIssue._id.toString());
  });

  // --- No-Change Handling ---

  it('should create an activity for a changed field but not when updated to the same value', async () => {
    await Issue.findByIdAndUpdate(issue._id, { status: 'todo' });
    issue = await Issue.findById(issue._id);

    const firstRes = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(firstRes).to.have.status(200);
    expect(firstRes.body).to.have.property('issue');
    expect(firstRes.body.issue).to.have.property('status', 'in_progress');

    let activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_status');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'status');
    expect(activities[0].changes).to.have.property('oldValue', 'todo');
    expect(activities[0].changes).to.have.property('newValue', 'in_progress');

    const secondRes = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(secondRes).to.have.status(200);
    expect(secondRes.body).to.have.property('issue');
    expect(secondRes.body.issue).to.have.property('status', 'in_progress');

    activities = await IssueActivity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
  });

  // --- Activity Ordering ---

  it('should return activities ordered by latest even when activities are created at the same time', async () => {
    const activity1 = new IssueActivity({
      issue: issue._id,
      user: user._id,
      action: 'updated_status',
    });
    await activity1.save();

    const activity2 = new IssueActivity({
      issue: issue._id,
      user: user._id,
      action: 'updated_priority',
    });
    await activity2.save();

    const sameDate = new Date('2024-01-01T00:00:00.000Z');
    await IssueActivity.collection.updateMany(
      { _id: { $in: [activity1._id, activity2._id] } },
      { $set: { createdAt: sameDate } }
    );

    const res = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}/activities`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('activities');
    expect(res.body.activities).to.be.an('array').with.length(2);

    const actions = res.body.activities.map((a) => a.action);

    expect(actions[0]).to.equal('updated_priority');
    expect(actions[1]).to.equal('updated_status');
  });
});
