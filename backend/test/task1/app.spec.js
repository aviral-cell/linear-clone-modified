import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app.js';

const { expect } = chai;
chai.use(chaiHttp);

describe('Task 2: Issue Management API', () => {
  let authToken;

  before(async () => {
    // Login to get auth token
    const res = await chai
      .request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@flow.dev',
        password: 'Password@123',
      });
    authToken = res.body.token;
  });

  describe('GET /api/teams', () => {
    it('should return all teams', (done) => {
      chai
        .request(app)
        .get('/api/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('teams');
          expect(res.body.teams).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /api/issues', () => {
    it('should create a new issue', (done) => {
      chai
        .request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Issue',
          teamId: '507f1f77bcf86cd799439011', // Replace with actual team ID
          status: 'todo',
          priority: 'medium',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('issue');
          expect(res.body.issue).to.have.property('title', 'Test Issue');
          done();
        });
    });
  });
});

