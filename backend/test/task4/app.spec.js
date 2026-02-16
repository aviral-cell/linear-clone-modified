import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Team from '../../src/models/Team.js';
import Issue from '../../src/models/Issue.js';
import IssueActivity from '../../src/models/IssueActivity.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue, IssueActivity]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Advanced Issue Filters Functionality Testing', function () {
  this.timeout(15000);

  let userA;
  let userB;
  let tokenA;
  let team;
  let parentIssue;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();

    const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
    if (dbName && !dbName.includes('Test')) {
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

    team = new Team({
      name: 'Filter Team',
      key: 'FLT',
      members: [userA._id, userB._id],
    });
    await team.save();
  });

  beforeEach(async () => {
    await Issue.deleteMany({});

    parentIssue = new Issue({
      identifier: 'FLT-1',
      title: 'Parent Issue',
      status: 'todo',
      priority: 'high',
      team: team._id,
      creator: userA._id,
      assignee: userA._id,
      parent: null,
    });
    await parentIssue.save();

    const issues = [
      {
        identifier: 'FLT-2',
        title: 'Child Todo High',
        status: 'todo',
        priority: 'high',
        team: team._id,
        creator: userA._id,
        assignee: userB._id,
        parent: parentIssue._id,
      },
      {
        identifier: 'FLT-3',
        title: 'In Progress Urgent',
        status: 'in_progress',
        priority: 'urgent',
        team: team._id,
        creator: userB._id,
        assignee: userA._id,
        parent: null,
      },
      {
        identifier: 'FLT-4',
        title: 'Done Low',
        status: 'done',
        priority: 'low',
        team: team._id,
        creator: userB._id,
        assignee: userB._id,
        parent: null,
      },
      {
        identifier: 'FLT-5',
        title: 'Backlog Medium',
        status: 'backlog',
        priority: 'medium',
        team: team._id,
        creator: userA._id,
        assignee: null,
        parent: parentIssue._id,
      },
      {
        identifier: 'FLT-6',
        title: 'Todo No Priority',
        status: 'todo',
        priority: 'no_priority',
        team: team._id,
        creator: userB._id,
        assignee: null,
        parent: null,
      },
    ];

    await Issue.insertMany(issues);
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  it('should filter issues by single and multiple comma-separated status values', async () => {
    const singleRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&status=todo`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(singleRes).to.have.status(200);
    expect(singleRes.body).to.have.property('issues');
    expect(singleRes.body.issues).to.be.an('array').with.lengthOf(3);
    singleRes.body.issues.forEach((issue) => {
      expect(issue.status).to.equal('todo');
    });

    const multiRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&status=in_progress,done`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(multiRes).to.have.status(200);
    expect(multiRes.body.issues).to.be.an('array').with.lengthOf(2);
    multiRes.body.issues.forEach((issue) => {
      expect(['in_progress', 'done']).to.include(issue.status);
    });
  });

  it('should filter issues by single and multiple comma-separated priority values', async () => {
    const singleRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&priority=high`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(singleRes).to.have.status(200);
    expect(singleRes.body.issues).to.be.an('array').with.lengthOf(2);
    singleRes.body.issues.forEach((issue) => {
      expect(issue.priority).to.equal('high');
    });
    const singleIdentifiers = singleRes.body.issues.map((i) => i.identifier);
    expect(singleIdentifiers).to.include.members(['FLT-1', 'FLT-2']);

    const multiRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&priority=urgent,low`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(multiRes).to.have.status(200);
    expect(multiRes.body.issues).to.be.an('array').with.lengthOf(2);
    multiRes.body.issues.forEach((issue) => {
      expect(['urgent', 'low']).to.include(issue.priority);
    });
  });

  it('should filter issues by assignee user ID', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&assignee=${userA._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res).to.have.status(200);
    expect(res.body.issues).to.be.an('array').with.lengthOf(2);
    res.body.issues.forEach((issue) => {
      expect(issue.assignee).to.exist;
      expect(issue.assignee._id.toString()).to.equal(userA._id.toString());
    });

    const identifiers = res.body.issues.map((i) => i.identifier);
    expect(identifiers).to.include.members(['FLT-1', 'FLT-3']);
  });

  it('should filter issues by creator user ID', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&creator=${userB._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res).to.have.status(200);
    expect(res.body.issues).to.be.an('array').with.lengthOf(3);
    res.body.issues.forEach((issue) => {
      expect(issue.creator._id.toString()).to.equal(userB._id.toString());
    });

    const identifiers = res.body.issues.map((i) => i.identifier);
    expect(identifiers).to.include.members(['FLT-3', 'FLT-4', 'FLT-6']);
  });

  it('should filter issues by parent=null for root issues and by specific parent ID for children', async () => {
    const nullRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&parent=null`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(nullRes).to.have.status(200);
    expect(nullRes.body.issues).to.be.an('array').with.lengthOf(4);
    nullRes.body.issues.forEach((issue) => {
      expect(issue.parent).to.be.null;
    });

    const parentRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&parent=${parentIssue._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(parentRes).to.have.status(200);
    expect(parentRes.body.issues).to.be.an('array').with.lengthOf(2);
    const identifiers = parentRes.body.issues.map((i) => i.identifier);
    expect(identifiers).to.include.members(['FLT-2', 'FLT-5']);
  });

  it('should apply multiple filters simultaneously and return empty array when no match', async () => {
    const combinedRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&status=todo&priority=high`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(combinedRes).to.have.status(200);
    expect(combinedRes.body.issues).to.be.an('array').with.lengthOf(2);
    combinedRes.body.issues.forEach((issue) => {
      expect(issue.status).to.equal('todo');
      expect(issue.priority).to.equal('high');
    });
    const identifiers = combinedRes.body.issues.map((i) => i.identifier);
    expect(identifiers).to.include.members(['FLT-1', 'FLT-2']);

    const emptyRes = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}&status=cancelled&priority=urgent`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(emptyRes).to.have.status(200);
    expect(emptyRes.body.issues).to.be.an('array').with.lengthOf(0);
  });

  it('should return all team issues with populated fields when no filters are applied', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues?teamId=${team._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res).to.have.status(200);
    expect(res.body.issues).to.be.an('array').with.lengthOf(6);

    const issueWithAssignee = res.body.issues.find((i) => i.identifier === 'FLT-1');
    expect(issueWithAssignee.assignee).to.have.property('name');
    expect(issueWithAssignee.assignee).to.have.property('email');
    expect(issueWithAssignee.creator).to.have.property('name');
    expect(issueWithAssignee.creator).to.have.property('email');
    expect(issueWithAssignee.team).to.have.property('name');
    expect(issueWithAssignee.team).to.have.property('key');
  });
});
