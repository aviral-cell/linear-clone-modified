import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Team from '../../src/models/Team.js';
import Project from '../../src/models/Project.js';
import ProjectActivity from '../../src/models/ProjectActivity.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, Team, Project, ProjectActivity]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Task 8: Project Lead Auto-Add to Members Testing', function () {
  let alice, bob, charlie;
  let aliceToken;
  let team;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDatabase();

    const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
    if (dbName && !dbName.includes('test')) {
      throw new Error(`Not connected to test database! Connected to: ${dbName}`);
    }

    await cleanupModels();

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.default.hash('password123', 12);

    alice = new User({ email: 'alice@test.com', password: hashedPassword, name: 'Alice' });
    bob = new User({ email: 'bob@test.com', password: hashedPassword, name: 'Bob' });
    charlie = new User({ email: 'charlie@test.com', password: hashedPassword, name: 'Charlie' });
    await Promise.all([alice.save(), bob.save(), charlie.save()]);

    aliceToken = generateToken(alice._id);

    team = new Team({
      name: 'Auto-Add Team',
      key: 'AAT',
      members: [alice._id, bob._id, charlie._id],
    });
    await team.save();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    await ProjectActivity.deleteMany({});
  });

  afterAll(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  // --- Create Project ---

  it('should auto-add lead to members when creating a project with leadId and no memberIds', async () => {
    const res = await chai
      .request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ name: 'Project Alpha', teamId: team._id.toString(), leadId: bob._id.toString() });

    expect(res).to.have.status(201);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(bob._id.toString());
  });

  it('should auto-add lead to members when creating a project with leadId and memberIds that exclude lead', async () => {
    const res = await chai
      .request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        name: 'Project Beta',
        teamId: team._id.toString(),
        leadId: bob._id.toString(),
        memberIds: [alice._id.toString()],
      });

    expect(res).to.have.status(201);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(bob._id.toString());
    expect(memberIds).to.include(alice._id.toString());
  });

  it('should not duplicate lead in members when creating a project with lead already in memberIds', async () => {
    const autoAddRes = await chai
      .request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        name: 'Project Gamma',
        teamId: team._id.toString(),
        leadId: bob._id.toString(),
        memberIds: [alice._id.toString()],
      });

    expect(autoAddRes).to.have.status(201);
    const autoAddMembers = autoAddRes.body.project.members.map((m) => m._id);
    expect(autoAddMembers).to.include(bob._id.toString());

    const dupRes = await chai
      .request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        name: 'Project Gamma Dup',
        teamId: team._id.toString(),
        leadId: bob._id.toString(),
        memberIds: [alice._id.toString(), bob._id.toString()],
      });

    expect(dupRes).to.have.status(201);
    const dupMembers = dupRes.body.project.members.map((m) => m._id);
    const bobCount = dupMembers.filter((id) => id === bob._id.toString()).length;
    expect(bobCount).to.equal(1);
  });

  // --- Update Lead Only ---

  it('should auto-add lead to members when updating leadId on a project with no members', async () => {
    const project = new Project({
      name: 'Empty Members',
      identifier: 'empty-members',
      team: team._id,
      creator: alice._id,
      members: [],
    });
    await project.save();

    const res = await chai
      .request(app)
      .put(`/api/projects/${project.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ leadId: bob._id.toString() });

    expect(res).to.have.status(200);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(bob._id.toString());
  });

  it('should auto-add lead to existing members when updating leadId without memberIds', async () => {
    const project = new Project({
      name: 'Has Members',
      identifier: 'has-members',
      team: team._id,
      creator: alice._id,
      members: [alice._id],
    });
    await project.save();

    const res = await chai
      .request(app)
      .put(`/api/projects/${project.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ leadId: bob._id.toString() });

    expect(res).to.have.status(200);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(bob._id.toString());
    expect(memberIds).to.include(alice._id.toString());
  });

  it('should not duplicate lead when updating leadId and lead is already a member', async () => {
    const autoAddProject = new Project({
      name: 'Lead Auto Add',
      identifier: 'lead-auto-add',
      team: team._id,
      creator: alice._id,
      members: [alice._id],
    });
    await autoAddProject.save();

    const autoAddRes = await chai
      .request(app)
      .put(`/api/projects/${autoAddProject.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ leadId: bob._id.toString() });

    expect(autoAddRes).to.have.status(200);
    const autoAddMembers = autoAddRes.body.project.members.map((m) => m._id);
    expect(autoAddMembers).to.include(bob._id.toString());

    const dupProject = new Project({
      name: 'Lead Already Member',
      identifier: 'lead-already-member',
      team: team._id,
      creator: alice._id,
      members: [alice._id, bob._id],
    });
    await dupProject.save();

    const dupRes = await chai
      .request(app)
      .put(`/api/projects/${dupProject.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ leadId: bob._id.toString() });

    expect(dupRes).to.have.status(200);
    const dupMembers = dupRes.body.project.members.map((m) => m._id);
    const bobCount = dupMembers.filter((id) => id === bob._id.toString()).length;
    expect(bobCount).to.equal(1);
  });

  // --- Update Lead + Members Together ---

  it('should enforce lead in members when updating both leadId and memberIds that exclude lead', async () => {
    const project = new Project({
      name: 'Both Updates',
      identifier: 'both-updates',
      team: team._id,
      creator: alice._id,
      members: [],
    });
    await project.save();

    const res = await chai
      .request(app)
      .put(`/api/projects/${project.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        leadId: charlie._id.toString(),
        memberIds: [alice._id.toString(), bob._id.toString()],
      });

    expect(res).to.have.status(200);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(charlie._id.toString());
    expect(memberIds).to.include(alice._id.toString());
    expect(memberIds).to.include(bob._id.toString());
  });

  // --- Update Members Only (lead already set) ---

  it('should enforce existing lead in members when updating only memberIds that exclude the lead', async () => {
    const project = new Project({
      name: 'Keep Lead',
      identifier: 'keep-lead',
      team: team._id,
      creator: alice._id,
      lead: charlie._id,
      members: [charlie._id],
    });
    await project.save();

    const res = await chai
      .request(app)
      .put(`/api/projects/${project.identifier}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ memberIds: [alice._id.toString(), bob._id.toString()] });

    expect(res).to.have.status(200);
    const memberIds = res.body.project.members.map((m) => m._id);
    expect(memberIds).to.include(charlie._id.toString());
    expect(memberIds).to.include(alice._id.toString());
    expect(memberIds).to.include(bob._id.toString());
  });
});
