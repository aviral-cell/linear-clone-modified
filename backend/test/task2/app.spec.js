import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../app.js';
import connectDatabase from '../../config/database.js';
import User from '../../models/User.js';
import Team from '../../models/Team.js';
import Issue from '../../models/Issue.js';
import Activity from '../../models/Activity.js';
import { generateToken } from '../../middleware/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue, Activity]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Activity Tracker - Create and Update Issues', function() {
  this.timeout(10000); // Increase timeout to 10 seconds for bcrypt hashing

  let user;
  let userToken;
  let team;
  let issue;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();
    
    const dbName = mongoose.connection.db?.databaseName;
    if (dbName && !dbName.includes('Test')) {
      throw new Error(`Not connected to test database! Connected to: ${dbName}`);
    }
    
    await cleanupModels();

    // Setup test user with hashed password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('password123', 12);
    
    user = new User({
      email: 'testuser@test.com',
      password: hashedPassword,
      name: 'Test User',
    });
    await user.save();
    userToken = generateToken(user._id);

    // Setup test team and base issue for testing
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
  });

  afterEach(async () => {
    await Activity.deleteMany({});
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  it('should create an activity with action "created" when an issue is created', async () => {
    const issueData = {
      title: 'Test Issue',
      description: 'Test Description',
      teamId: team._id.toString(),
      status: 'todo',
      priority: 'high',
    };

    const res = await chai
      .request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send(issueData);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('identifier');

    const createdIssue = await Issue.findOne({ identifier: res.body.issue.identifier });
    expect(createdIssue).to.exist;

    const activities = await Activity.find({ issue: createdIssue._id });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'created');
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());
    expect(activities[0]).to.have.property('issue');
    expect(activities[0].issue.toString()).to.equal(createdIssue._id.toString());
    expect(activities[0].changes?.field).to.be.undefined;
  });

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

    const activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
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

    const activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
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

    const activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
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
    // Test 1: Assign user to issue (null → user)
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

    let activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_assignee');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'assignee');
    expect(activities[0].changes).to.have.property('oldValue', null);
    expect(activities[0].changes.newValue.toString()).to.equal(user._id.toString());
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());

    // Test 2: Remove assignee from issue (user → null)
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

    activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(2);
    expect(activities[0]).to.have.property('action', 'updated_assignee');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'assignee');
    expect(activities[0].changes.oldValue.toString()).to.equal(user._id.toString());
    expect(activities[0].changes).to.have.property('newValue', null);
    expect(activities[0]).to.have.property('user');
    expect(activities[0].user.toString()).to.equal(user._id.toString());
  });

  it('should create multiple activities when multiple fields are updated simultaneously', async () => {
    await Issue.findByIdAndUpdate(issue._id, {
      title: 'Original Title',
      description: 'Original Description',
      status: 'todo',
      priority: 'no_priority',
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
      });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue).to.have.property('status', 'in_progress');
    expect(res.body.issue).to.have.property('priority', 'high');
    expect(res.body.issue).to.have.property('title', 'Updated Title');

    const activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(3);

    const actionTypes = activities.map((a) => a.action);
    expect(actionTypes).to.include.members(['updated_status', 'updated_priority', 'updated_title']);
    expect(actionTypes.length).to.equal(3);

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
  });

  it('should return activities ordered by latest even when activities are created at the same time', async () => {
    const activity1 = new Activity({
      issue: issue._id,
      user: user._id,
      action: 'updated_status',
    });
    await activity1.save();

    const activity2 = new Activity({
      issue: issue._id,
      user: user._id,
      action: 'updated_priority',
    });
    await activity2.save();

    // Force same createdAt timestamp to test secondary sort
    // Using collection.updateMany to bypass Mongoose's immutable createdAt handling
    const sameDate = new Date('2024-01-01T00:00:00.000Z');
    await Activity.collection.updateMany(
      { _id: { $in: [activity1._id, activity2._id] } },
      { $set: { createdAt: sameDate } }
    );

    const res = await chai
      .request(app)
      .get(`/api/activities/issue/${issue._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('activities');
    expect(res.body.activities).to.be.an('array').with.length(2);

    const actions = res.body.activities.map((a) => a.action);

    // When timestamps are equal, should have secondary sort
    // activity2 was created after activity1, so it should appear first
    expect(actions[0]).to.equal('updated_priority');
    expect(actions[1]).to.equal('updated_status');
  });

  it('should create an activity for a changed field but not when updated to the same value', async () => {
    // Ensure initial status is 'todo'
    await Issue.findByIdAndUpdate(issue._id, { status: 'todo' });
    issue = await Issue.findById(issue._id);

    // First update: change status from 'todo' to 'in_progress' → should create activity
    const firstRes = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(firstRes).to.have.status(200);
    expect(firstRes.body).to.have.property('issue');
    expect(firstRes.body.issue).to.have.property('status', 'in_progress');

    let activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
    expect(activities[0]).to.have.property('action', 'updated_status');
    expect(activities[0]).to.have.property('changes');
    expect(activities[0].changes).to.have.property('field', 'status');
    expect(activities[0].changes).to.have.property('oldValue', 'todo');
    expect(activities[0].changes).to.have.property('newValue', 'in_progress');

    // Second update: set status to the same value 'in_progress' → should NOT create new activity
    const secondRes = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'in_progress' });

    expect(secondRes).to.have.status(200);
    expect(secondRes.body).to.have.property('issue');
    expect(secondRes.body.issue).to.have.property('status', 'in_progress');

    activities = await Activity.find({ issue: issue._id }).sort({ createdAt: -1 });
    expect(activities).to.be.an('array').with.length(1);
  });
});

