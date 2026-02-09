import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../app.js';
import connectDatabase from '../../config/database.js';
import User from '../../models/User.js';
import Team from '../../models/Team.js';
import Issue from '../../models/Issue.js';
import IssueActivity from '../../models/IssueActivity.js';
import { generateToken } from '../../middleware/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Issue, IssueActivity]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Sub-Issue Hierarchy - N-Level Deep & Circular Reference Prevention', function () {
  this.timeout(15000);

  let user;
  let userToken;
  let team;
  let teamB;

  let issueA;
  let issueB;
  let issueC;
  let issueD;
  let issueE;
  let issueF;

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

    teamB = new Team({
      name: 'Other Team',
      key: 'OTHER',
      members: [user._id],
    });
    await teamB.save();
  });

  beforeEach(async () => {
    await Issue.deleteMany({});
    await IssueActivity.deleteMany({});

    issueA = new Issue({
      identifier: 'TEST-1',
      title: 'Issue A (Root)',
      description: 'Root issue',
      team: team._id,
      creator: user._id,
      status: 'todo',
      parent: null,
    });
    await issueA.save();

    issueB = new Issue({
      identifier: 'TEST-2',
      title: 'Issue B (Child of A)',
      description: 'First level child',
      team: team._id,
      creator: user._id,
      status: 'todo',
      parent: issueA._id,
    });
    await issueB.save();

    issueC = new Issue({
      identifier: 'TEST-3',
      title: 'Issue C (Child of B)',
      description: 'Second level child',
      team: team._id,
      creator: user._id,
      status: 'todo',
      parent: issueB._id,
    });
    await issueC.save();

    issueD = new Issue({
      identifier: 'TEST-4',
      title: 'Issue D (Child of C)',
      description: 'Third level child',
      team: team._id,
      creator: user._id,
      status: 'in_progress',
      parent: issueC._id,
    });
    await issueD.save();

    issueE = new Issue({
      identifier: 'TEST-5',
      title: 'Issue E (Standalone)',
      description: 'No parent',
      team: team._id,
      creator: user._id,
      status: 'todo',
      parent: null,
    });
    await issueE.save();

    issueF = new Issue({
      identifier: 'OTHER-1',
      title: 'Issue F (Different Team)',
      description: 'Different team issue',
      team: teamB._id,
      creator: user._id,
      status: 'todo',
      parent: null,
    });
    await issueF.save();
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  it('should return valid parent candidates excluding self and all descendants', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues/${issueA.identifier}/valid-parents`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('validParents');
    expect(res.body.validParents).to.be.an('array');

    const validIdentifiers = res.body.validParents.map((p) => p.identifier);

    expect(validIdentifiers).to.not.include('TEST-1');
    expect(validIdentifiers).to.not.include('TEST-2');
    expect(validIdentifiers).to.not.include('TEST-3');
    expect(validIdentifiers).to.not.include('TEST-4');
    expect(validIdentifiers).to.include('TEST-5');
    expect(validIdentifiers).to.not.include('OTHER-1');
  });

  it('should return ancestors and siblings as valid parent candidates', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues/${issueD.identifier}/valid-parents`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('validParents');

    const validIdentifiers = res.body.validParents.map((p) => p.identifier);

    expect(validIdentifiers).to.include('TEST-1');
    expect(validIdentifiers).to.include('TEST-2');
    expect(validIdentifiers).to.include('TEST-3');
    expect(validIdentifiers).to.include('TEST-5');
    expect(validIdentifiers).to.not.include('TEST-4');
  });

  it('should only include issues from the same team', async () => {
    const res = await chai
      .request(app)
      .get(`/api/issues/${issueE.identifier}/valid-parents`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('validParents');

    const validIdentifiers = res.body.validParents.map((p) => p.identifier);

    expect(validIdentifiers).to.include('TEST-1');
    expect(validIdentifiers).to.include('TEST-2');
    expect(validIdentifiers).to.include('TEST-3');
    expect(validIdentifiers).to.include('TEST-4');
    expect(validIdentifiers).to.not.include('OTHER-1');
    expect(validIdentifiers).to.not.include('TEST-5');
  });

  it('should return 404 for non-existent issue identifier', async () => {
    const res = await chai
      .request(app)
      .get('/api/issues/NONEXISTENT-999/valid-parents')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res).to.have.status(404);
    expect(res.body).to.have.property('message', 'Issue not found');
  });

  it('should return 401 when called without authentication', async () => {
    const res = await chai.request(app).get(`/api/issues/${issueA.identifier}/valid-parents`);

    expect(res).to.have.status(401);
  });

  it('should reject setting an issue as its own parent (self-parenting)', async () => {
    const res = await chai
      .request(app)
      .put(`/api/issues/${issueA.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ parent: issueA._id.toString() });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message');
    expect(res.body.message.toLowerCase()).to.include('own parent');
  });

  it('should reject setting a direct child as parent (direct circular reference)', async () => {
    const res = await chai
      .request(app)
      .put(`/api/issues/${issueA.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ parent: issueB._id.toString() });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message');
    expect(res.body.message.toLowerCase()).to.satisfy(
      (msg) => msg.includes('circular') || msg.includes('descendant')
    );
  });

  it('should reject setting an indirect descendant as parent (deep circular reference)', async () => {
    const res = await chai
      .request(app)
      .put(`/api/issues/${issueA.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ parent: issueD._id.toString() });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message');
    expect(res.body.message.toLowerCase()).to.satisfy(
      (msg) => msg.includes('circular') || msg.includes('descendant')
    );
  });

  it('should allow updating parent to a valid issue (sibling)', async () => {
    const res = await chai
      .request(app)
      .put(`/api/issues/${issueD.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ parent: issueE._id.toString() });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue.parent).to.exist;

    const updatedIssue = await Issue.findById(issueD._id);
    expect(updatedIssue.parent.toString()).to.equal(issueE._id.toString());
  });

  it('should allow removing parent (set to null)', async () => {
    const res = await chai
      .request(app)
      .put(`/api/issues/${issueD.identifier}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ parent: null });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('issue');
    expect(res.body.issue.parent).to.be.null;

    const updatedIssue = await Issue.findById(issueD._id);
    expect(updatedIssue.parent).to.be.null;
  });

  it('should allow creating n-level deep sub-issues via API', async () => {
    const createRes = await chai
      .request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Issue G (Child of D - 5th level)',
        description: 'Fifth level deep',
        teamId: team._id.toString(),
        status: 'todo',
        parent: issueD._id.toString(),
      });

    expect(createRes).to.have.status(201);
    expect(createRes.body).to.have.property('issue');
    expect(createRes.body.issue).to.have.property('identifier');

    const createdIssue = await Issue.findOne({ identifier: createRes.body.issue.identifier });
    expect(createdIssue).to.exist;
    expect(createdIssue.parent.toString()).to.equal(issueD._id.toString());

    const createRes2 = await chai
      .request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Issue H (Child of G - 6th level)',
        description: 'Sixth level deep',
        teamId: team._id.toString(),
        status: 'todo',
        parent: createdIssue._id.toString(),
      });

    expect(createRes2).to.have.status(201);
    expect(createRes2.body).to.have.property('issue');

    const level6Issue = await Issue.findOne({ identifier: createRes2.body.issue.identifier });
    expect(level6Issue).to.exist;
    expect(level6Issue.parent.toString()).to.equal(createdIssue._id.toString());
  });
});
