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

  // Issues for hierarchy testing: A → B → C → D (4 levels deep)
  let issueA; // Root issue
  let issueB; // Child of A
  let issueC; // Child of B (grandchild of A)
  let issueD; // Child of C (great-grandchild of A)
  let issueE; // Standalone issue (no parent, same team)
  let issueF; // Issue in different team

  before(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();

    const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
    if (dbName && !dbName.includes('Test')) {
      throw new Error(`Not connected to test database! Connected to: ${dbName}`);
    }

    await cleanupModels();

    // Setup test user
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('password123', 12);

    user = new User({
      email: 'testuser@test.com',
      password: hashedPassword,
      name: 'Test User',
    });
    await user.save();
    userToken = generateToken(user._id);

    // Setup teams
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
    // Clean issues and activities before each test
    await Issue.deleteMany({});
    await IssueActivity.deleteMany({});

    // Create hierarchy: A → B → C → D
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

    // Standalone issue in same team
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

    // Issue in different team
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

  // ============================================
  // GET /api/issues/:identifier/valid-parents
  // ============================================

  describe('GET /api/issues/:identifier/valid-parents', () => {
    it('should return valid parent candidates excluding self and all descendants', async () => {
      // For Issue A, valid parents should exclude: A (self), B, C, D (descendants)
      // Should include: E (standalone in same team)
      const res = await chai
        .request(app)
        .get(`/api/issues/${issueA.identifier}/valid-parents`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('validParents');
      expect(res.body.validParents).to.be.an('array');

      const validIdentifiers = res.body.validParents.map((p) => p.identifier);

      // Should NOT include self (A) or descendants (B, C, D)
      expect(validIdentifiers).to.not.include('TEST-1'); // A (self)
      expect(validIdentifiers).to.not.include('TEST-2'); // B (child)
      expect(validIdentifiers).to.not.include('TEST-3'); // C (grandchild)
      expect(validIdentifiers).to.not.include('TEST-4'); // D (great-grandchild)

      // Should include standalone issue E
      expect(validIdentifiers).to.include('TEST-5');

      // Should NOT include issue from different team
      expect(validIdentifiers).to.not.include('OTHER-1');
    });

    it('should return ancestors and siblings as valid parent candidates', async () => {
      // For Issue D (deepest), valid parents should include: A, B, C (ancestors) and E (sibling of A)
      const res = await chai
        .request(app)
        .get(`/api/issues/${issueD.identifier}/valid-parents`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('validParents');

      const validIdentifiers = res.body.validParents.map((p) => p.identifier);

      // Should include ancestors
      expect(validIdentifiers).to.include('TEST-1'); // A (great-grandparent)
      expect(validIdentifiers).to.include('TEST-2'); // B (grandparent)
      expect(validIdentifiers).to.include('TEST-3'); // C (current parent)

      // Should include sibling of A
      expect(validIdentifiers).to.include('TEST-5'); // E

      // Should NOT include self
      expect(validIdentifiers).to.not.include('TEST-4'); // D (self)
    });

    it('should return hierarchy information with ancestors and descendants', async () => {
      // For Issue B, ancestors: [A], descendants: [C, D]
      const res = await chai
        .request(app)
        .get(`/api/issues/${issueB.identifier}/valid-parents`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('hierarchy');
      expect(res.body.hierarchy).to.have.property('ancestors');
      expect(res.body.hierarchy).to.have.property('descendants');

      // B's ancestors should include A
      expect(res.body.hierarchy.ancestors).to.include('TEST-1');

      // B's descendants should include C and D
      expect(res.body.hierarchy.descendants).to.include('TEST-3');
      expect(res.body.hierarchy.descendants).to.include('TEST-4');
    });

    it('should only include issues from the same team', async () => {
      const res = await chai
        .request(app)
        .get(`/api/issues/${issueE.identifier}/valid-parents`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('validParents');

      const validIdentifiers = res.body.validParents.map((p) => p.identifier);

      // Should include issues from same team (TEST-*)
      expect(validIdentifiers).to.include('TEST-1');
      expect(validIdentifiers).to.include('TEST-2');
      expect(validIdentifiers).to.include('TEST-3');
      expect(validIdentifiers).to.include('TEST-4');

      // Should NOT include issues from different team
      expect(validIdentifiers).to.not.include('OTHER-1');

      // Should NOT include self
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
  });

  // ============================================
  // PUT /api/issues/:identifier (parent updates)
  // ============================================

  describe('PUT /api/issues/:identifier - Circular Reference Prevention', () => {
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
      // Try to set B (child of A) as parent of A → would create A ↔ B cycle
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
      // Try to set D (great-grandchild of A) as parent of A → would create cycle
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
      // Set E as parent of D (E is not in D's hierarchy)
      const res = await chai
        .request(app)
        .put(`/api/issues/${issueD.identifier}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parent: issueE._id.toString() });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('issue');
      expect(res.body.issue.parent).to.exist;

      // Verify in database
      const updatedIssue = await Issue.findById(issueD._id);
      expect(updatedIssue.parent.toString()).to.equal(issueE._id.toString());
    });

    it('should allow removing parent (set to null)', async () => {
      // Remove parent from D (currently C)
      const res = await chai
        .request(app)
        .put(`/api/issues/${issueD.identifier}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ parent: null });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('issue');
      expect(res.body.issue.parent).to.be.null;

      // Verify in database
      const updatedIssue = await Issue.findById(issueD._id);
      expect(updatedIssue.parent).to.be.null;
    });

    it('should allow creating n-level deep sub-issues via API', async () => {
      // Create a 5th level issue (child of D)
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

      // Verify the parent is set correctly
      const createdIssue = await Issue.findOne({ identifier: createRes.body.issue.identifier });
      expect(createdIssue).to.exist;
      expect(createdIssue.parent.toString()).to.equal(issueD._id.toString());

      // Create a 6th level issue (child of the 5th level issue)
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
});
