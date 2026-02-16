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

describe('Issue Comments Functionality Testing', () => {
  let ownerUser;
  let otherUser;
  let ownerToken;
  let otherToken;
  let team;
  let issue;
  let comment1;

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

    ownerUser = new User({
      email: 'owner@test.com',
      password: hashedPassword,
      name: 'Owner User',
    });
    await ownerUser.save();
    ownerToken = generateToken(ownerUser._id);

    otherUser = new User({
      email: 'other@test.com',
      password: hashedPassword,
      name: 'Other User',
    });
    await otherUser.save();
    otherToken = generateToken(otherUser._id);

    team = new Team({
      name: 'Test Team',
      key: 'TEST',
      members: [ownerUser._id, otherUser._id],
    });
    await team.save();

    issue = new Issue({
      identifier: 'TEST-1',
      title: 'Test Issue',
      description: 'Test Description',
      team: team._id,
      creator: ownerUser._id,
      status: 'todo',
    });
    await issue.save();
  });

  afterEach(async () => {
    await cleanupModels([Comment, IssueActivity]);
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  it('should return isOwner field correctly for all comments', async () => {
    const comments = [
      new Comment({
        issue: issue._id,
        user: ownerUser._id,
        content: 'Comment 1 by owner',
      }),
      new Comment({
        issue: issue._id,
        user: otherUser._id,
        content: 'Comment 2 by other user',
      }),
      new Comment({
        issue: issue._id,
        user: ownerUser._id,
        content: 'Comment 3 by owner',
      }),
      new Comment({
        issue: issue._id,
        user: otherUser._id,
        content: 'Comment 4 by other user',
      }),
    ];
    await Promise.all(comments.map((c) => c.save()));

    const resAsOwner = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}/comments`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(resAsOwner).to.have.status(200);
    expect(resAsOwner.body.comments).to.be.an('array').with.length(4);

    resAsOwner.body.comments.forEach((comment) => {
      expect(comment).to.have.property('isOwner').that.is.a('boolean');
    });

    const ownerComments = resAsOwner.body.comments.filter((c) => c.content.includes('by owner'));
    const otherUserComments = resAsOwner.body.comments.filter((c) =>
      c.content.includes('by other user')
    );

    ownerComments.forEach((comment) => {
      expect(comment.isOwner).to.be.true;
    });

    otherUserComments.forEach((comment) => {
      expect(comment.isOwner).to.be.false;
    });

    const resAsOtherUser = await chai
      .request(app)
      .get(`/api/issues/${issue.identifier}/comments`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(resAsOtherUser).to.have.status(200);
    expect(resAsOtherUser.body.comments).to.have.length(4);

    resAsOtherUser.body.comments.forEach((comment) => {
      expect(comment).to.have.property('isOwner').that.is.a('boolean');
    });

    const ownerCommentsForOtherUser = resAsOtherUser.body.comments.filter((c) =>
      c.content.includes('by owner')
    );
    const otherUserCommentsForOtherUser = resAsOtherUser.body.comments.filter((c) =>
      c.content.includes('by other user')
    );

    ownerCommentsForOtherUser.forEach((comment) => {
      expect(comment.isOwner).to.be.false;
    });

    otherUserCommentsForOtherUser.forEach((comment) => {
      expect(comment.isOwner).to.be.true;
    });
  });

  it('should update a comment successfully when user is owner', async () => {
    comment1 = new Comment({
      issue: issue._id,
      user: ownerUser._id,
      content: 'Original comment',
    });
    await comment1.save();

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}/comments/${comment1._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'Updated comment' });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('comment');
    expect(res.body.comment).to.have.property('content', 'Updated comment');
    expect(res.body.comment).to.have.property('isEdited', true);

    const commentAfterUpdate = await Comment.findById(comment1._id);
    expect(commentAfterUpdate.isEdited).to.be.true;
    expect(commentAfterUpdate.content).to.equal('Updated comment');
  });

  it('should return 403 when non-owner tries to update comment', async () => {
    comment1 = new Comment({
      issue: issue._id,
      user: ownerUser._id,
      content: 'Original comment',
    });
    await comment1.save();

    const res = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}/comments/${comment1._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Updated comment' });

    expect(res).to.have.status(403);
    expect(res.body).to.have.property('message', 'Not authorized');
  });

  it('should delete a comment successfully when user is owner', async () => {
    comment1 = new Comment({
      issue: issue._id,
      user: ownerUser._id,
      content: 'Comment to delete',
    });
    await comment1.save();

    const res = await chai
      .request(app)
      .delete(`/api/issues/${issue.identifier}/comments/${comment1._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message', 'Comment deleted successfully');

    const deletedComment = await Comment.findById(comment1._id);
    expect(deletedComment).to.be.null;
  });

  it('should return 403 when non-owner tries to delete comment', async () => {
    comment1 = new Comment({
      issue: issue._id,
      user: ownerUser._id,
      content: 'Comment to delete',
    });
    await comment1.save();

    const res = await chai
      .request(app)
      .delete(`/api/issues/${issue.identifier}/comments/${comment1._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res).to.have.status(403);
    expect(res.body).to.have.property('message', 'Not authorized');

    const existingComment = await Comment.findById(comment1._id);
    expect(existingComment).to.exist;
  });

  it('should return 401 when update and delete are called without authentication', async () => {
    comment1 = new Comment({
      issue: issue._id,
      user: ownerUser._id,
      content: 'Test comment',
    });
    await comment1.save();

    const updateRes = await chai
      .request(app)
      .put(`/api/issues/${issue.identifier}/comments/${comment1._id}`)
      .send({ content: 'Updated comment' });

    expect(updateRes).to.have.status(401);

    const deleteRes = await chai.request(app).delete(`/api/issues/${issue.identifier}/comments/${comment1._id}`);

    expect(deleteRes).to.have.status(401);

    const existingComment = await Comment.findById(comment1._id);
    expect(existingComment).to.exist;
  });
});
