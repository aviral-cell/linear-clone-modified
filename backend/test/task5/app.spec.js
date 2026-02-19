import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Team from '../../src/models/Team.js';
import Issue from '../../src/models/Issue.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Task 5: Issue Subscribe Testing', function () {
  this.timeout(15000);

  let userA;
  let userB;
  let tokenA;
  let tokenB;
  let team;
  let issue;

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

    userA = new User({
      email: 'usera@test.com',
      password: hashedPassword,
      name: 'User A',
    });
    await userA.save();
    tokenA = generateToken(userA._id);

    userB = new User({
      email: 'userb@test.com',
      password: hashedPassword,
      name: 'User B',
    });
    await userB.save();
    tokenB = generateToken(userB._id);

    team = new Team({
      name: 'Subscribe Team',
      key: 'SUB',
      members: [userA._id, userB._id],
    });
    await team.save();
  });

  beforeEach(async () => {
    await Issue.deleteMany({});

    issue = new Issue({
      identifier: 'SUB-1',
      title: 'Subscribe Test Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: userA._id,
      assignee: userB._id,
      subscribers: [],
    });
    await issue.save();
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  // --- Toggle Subscribe ---

  it('should subscribe a user to an issue and unsubscribe on second toggle', async () => {
    const subscribeRes = await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(subscribeRes).to.have.status(200);
    expect(subscribeRes.body).to.have.property('subscribed', true);

    const issueAfterSubscribe = await Issue.findById(issue._id);
    expect(issueAfterSubscribe.subscribers).to.have.lengthOf(1);
    expect(issueAfterSubscribe.subscribers[0].toString()).to.equal(userA._id.toString());

    const unsubscribeRes = await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(unsubscribeRes).to.have.status(200);
    expect(unsubscribeRes.body).to.have.property('subscribed', false);

    const issueAfterUnsubscribe = await Issue.findById(issue._id);
    expect(issueAfterUnsubscribe.subscribers).to.have.lengthOf(0);
  });

  // --- Multi-User Subscribe ---

  it('should allow multiple users to subscribe independently', async () => {
    const resA = await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(resA).to.have.status(200);
    expect(resA.body).to.have.property('subscribed', true);

    const resB = await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB).to.have.status(200);
    expect(resB.body).to.have.property('subscribed', true);

    const issueWithBoth = await Issue.findById(issue._id);
    expect(issueWithBoth.subscribers).to.have.lengthOf(2);

    const subscriberIds = issueWithBoth.subscribers.map((s) => s.toString());
    expect(subscriberIds).to.include(userA._id.toString());
    expect(subscriberIds).to.include(userB._id.toString());

    const unsubA = await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(unsubA).to.have.status(200);
    expect(unsubA.body).to.have.property('subscribed', false);

    const issueAfter = await Issue.findById(issue._id);
    expect(issueAfter.subscribers).to.have.lengthOf(1);
    expect(issueAfter.subscribers[0].toString()).to.equal(userB._id.toString());
  });

  // --- Error Handling ---

  it('should return 404 when toggling subscribe on a non-existent issue', async () => {
    const res = await chai
      .request(app)
      .post('/api/issues/NONEXISTENT-999/subscribe')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('message', 'Issue not found');
  });

  // --- Issue Detail Response ---

  it('should return isSubscribed boolean in issue details response', async () => {
    const detailBefore = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(detailBefore).to.have.status(200);
    expect(detailBefore.body).to.have.property('isSubscribed', false);
    expect(detailBefore.body).to.have.property('issue');
    expect(detailBefore.body).to.have.property('subIssues');

    await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    const detailAfter = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(detailAfter).to.have.status(200);
    expect(detailAfter.body).to.have.property('isSubscribed', true);

    const detailAsUserB = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(detailAsUserB).to.have.status(200);
    expect(detailAsUserB.body).to.have.property('isSubscribed', false);
  });

  // --- My Issues Filter ---

  it('should return subscribed issues via my-issues API with subscribed filter', async () => {
    const issue2 = new Issue({
      identifier: 'SUB-2',
      title: 'Another Issue',
      status: 'in_progress',
      priority: 'medium',
      team: team._id,
      creator: userB._id,
      assignee: userB._id,
      subscribers: [],
    });
    await issue2.save();

    await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    await chai
      .request(app)
      .post(`/api/issues/${issue2.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    const subscribedRes = await chai
      .request(app)
      .get('/api/issues/my-issues?filter=subscribed')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(subscribedRes).to.have.status(200);
    expect(subscribedRes.body).to.have.property('issues');
    expect(subscribedRes.body.issues).to.be.an('array').with.lengthOf(2);

    const identifiers = subscribedRes.body.issues.map((i) => i.identifier);
    expect(identifiers).to.include('SUB-1');
    expect(identifiers).to.include('SUB-2');

    const emptyRes = await chai
      .request(app)
      .get('/api/issues/my-issues?filter=subscribed')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(emptyRes).to.have.status(200);
    expect(emptyRes.body.issues).to.be.an('array').with.lengthOf(0);
  });

  it('should not include unsubscribed issues in subscribed filter results', async () => {
    await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    await chai
      .request(app)
      .post(`/api/issues/${issue.identifier}/subscribe`)
      .set('Authorization', `Bearer ${tokenA}`);

    const res = await chai
      .request(app)
      .get('/api/issues/my-issues?filter=subscribed')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res).to.have.status(200);
    expect(res.body.issues).to.be.an('array').with.lengthOf(0);
  });
});
