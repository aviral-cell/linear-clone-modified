import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import connectDatabase from '../../src/config/database.js';
import User from '../../src/models/User.js';
import ApiLog from '../../src/models/ApiLog.js';
import { generateToken } from '../../src/utils/auth.js';

chai.use(chaiHttp);
const { expect } = chai;

const cleanupModels = async (models = [User, ApiLog]) => {
  await Promise.all(models.map((Model) => Model.deleteMany({})));
};

describe('Task 6: API Logger Testing', function () {
  this.timeout(15000);

  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;

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

    adminUser = new User({
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    });
    await adminUser.save();
    adminToken = generateToken(adminUser._id);

    regularUser = new User({
      email: 'user@test.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'member',
    });
    await regularUser.save();
    regularToken = generateToken(regularUser._id);
  });

  afterEach(async () => {
    await ApiLog.deleteMany({});
  });

  after(async () => {
    await cleanupModels();
    await mongoose.connection.close();
  });

  // --- Access Control ---

  it('should enforce admin-only access for all log endpoints', async () => {
    const resAdmin = await chai
      .request(app)
      .get('/api/admin/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resAdmin).to.have.status(200);
    expect(resAdmin.body).to.have.property('logs');
    expect(resAdmin.body).to.have.property('pagination');

    const resRegular = await chai
      .request(app)
      .get('/api/admin/logs')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(resRegular).to.have.status(403);
    expect(resRegular.body.message).to.match(/admin access/i);

    const resNoAuth = await chai.request(app).get('/api/admin/logs');

    expect(resNoAuth).to.have.status(401);
  });

  // --- Automatic Logging ---

  it('should create API logs automatically for requests', async () => {
    await ApiLog.deleteMany({});

    await chai.request(app).get('/api/admin/logs').set('Authorization', `Bearer ${adminToken}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const logs = await ApiLog.find({});
    expect(logs).to.have.length.greaterThan(0);

    const logEntry = logs[0];
    expect(logEntry).to.have.property('method');
    expect(logEntry).to.have.property('path');
    expect(logEntry).to.have.property('statusCode');
    expect(logEntry).to.have.property('responseTime');
    expect(logEntry).to.have.property('timestamp');
  });

  // --- Pagination ---

  it('should fetch all logs with correct pagination', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        responseTime: 50,
        userId: adminUser._id,
        userEmail: adminUser.email,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      },
      {
        method: 'POST',
        path: '/api/issues',
        statusCode: 201,
        responseTime: 120,
        userId: regularUser._id,
        userEmail: regularUser.email,
        timestamp: new Date('2024-01-01T11:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/teams',
        statusCode: 404,
        responseTime: 30,
        userId: adminUser._id,
        userEmail: adminUser.email,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        isError: true,
      },
      {
        method: 'DELETE',
        path: '/api/comments/123',
        statusCode: 500,
        responseTime: 2000,
        userId: regularUser._id,
        userEmail: regularUser.email,
        timestamp: new Date('2024-01-01T13:00:00Z'),
        isError: true,
        isSlow: true,
      },
    ];

    await ApiLog.insertMany(logsData);

    const res = await chai
      .request(app)
      .get('/api/admin/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('logs');
    expect(res.body.logs).to.be.an('array');
    expect(res.body).to.have.property('pagination');
    expect(res.body.pagination).to.have.property('page', 1);
    expect(res.body.pagination).to.have.property('limit', 50);
    expect(res.body.pagination.totalLogs).to.be.at.least(4);

    const allPaths = res.body.logs.map((log) => log.path);
    expect(allPaths).to.include('/api/users');
    expect(allPaths).to.include('/api/issues');
    expect(allPaths).to.include('/api/teams');
    expect(allPaths).to.include('/api/comments/123');

    const resPaginated = await chai
      .request(app)
      .get('/api/admin/logs?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resPaginated).to.have.status(200);
    expect(resPaginated.body.logs).to.have.length(2);
    expect(resPaginated.body.pagination).to.have.property('page', 1);
    expect(resPaginated.body.pagination).to.have.property('limit', 2);
    expect(resPaginated.body.pagination.totalLogs).to.be.at.least(4);
    expect(resPaginated.body.pagination).to.have.property('hasNextPage', true);
    expect(resPaginated.body.pagination).to.have.property('hasPrevPage', false);
  });

  // --- Single Log Retrieval ---

  it('should fetch single log by ID and handle errors correctly', async () => {
    const log = await ApiLog.create({
      method: 'GET',
      path: '/api/test',
      statusCode: 200,
      responseTime: 50,
      userId: adminUser._id,
      userEmail: adminUser.email,
    });

    const resValid = await chai
      .request(app)
      .get(`/api/admin/logs/${log._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resValid).to.have.status(200);
    expect(resValid.body).to.have.property('log');
    expect(resValid.body.log).to.have.property('_id', log._id.toString());
    expect(resValid.body.log).to.have.property('method', 'GET');
    expect(resValid.body.log).to.have.property('path', '/api/test');
    expect(resValid.body.log).to.have.property('statusCode', 200);

    const fakeId = new mongoose.Types.ObjectId();
    const resNotFound = await chai
      .request(app)
      .get(`/api/admin/logs/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resNotFound).to.have.status(404);
    expect(resNotFound.body.message).to.match(/not found/i);

    const resInvalid = await chai
      .request(app)
      .get('/api/admin/logs/invalid-id-format')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resInvalid).to.have.status(400);
    expect(resInvalid.body.message).to.match(/invalid log id/i);
  });

  // --- Filter by Method ---

  it('should filter logs by HTTP method', async () => {
    const logsData = [
      { method: 'POST', path: '/api/test1', statusCode: 201, responseTime: 60 },
      { method: 'PUT', path: '/api/test2', statusCode: 200, responseTime: 70 },
      { method: 'DELETE', path: '/api/test3', statusCode: 204, responseTime: 40 },
      { method: 'POST', path: '/api/test4', statusCode: 201, responseTime: 55 },
    ];

    await ApiLog.insertMany(logsData);

    const res = await chai
      .request(app)
      .get('/api/admin/logs?method=POST')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body.logs).to.have.length(2);

    const postLogs = res.body.logs.filter((log) => log.method === 'POST');
    expect(postLogs).to.have.length(2);

    const paths = postLogs.map((log) => log.path).sort();
    expect(paths).to.deep.equal(['/api/test1', '/api/test4']);
  });

  // --- Filter by Status Code ---

  it('should filter logs by status code ranges and exact values', async () => {
    const logsData = [
      { method: 'GET', path: '/api/test1', statusCode: 200, responseTime: 50 },
      { method: 'GET', path: '/api/test2', statusCode: 201, responseTime: 60 },
      { method: 'GET', path: '/api/test3', statusCode: 400, responseTime: 70 },
      { method: 'GET', path: '/api/test4', statusCode: 404, responseTime: 40 },
      { method: 'GET', path: '/api/test5', statusCode: 500, responseTime: 55 },
      { method: 'GET', path: '/api/test6', statusCode: 503, responseTime: 65 },
    ];

    await ApiLog.insertMany(logsData);

    const res2xx = await chai
      .request(app)
      .get('/api/admin/logs?statusCode=2xx')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res2xx).to.have.status(200);
    expect(res2xx.body.logs).to.have.length(2);
    res2xx.body.logs.forEach((log) => {
      expect(log.statusCode).to.be.at.least(200);
      expect(log.statusCode).to.be.below(300);
    });

    const res4xx = await chai
      .request(app)
      .get('/api/admin/logs?statusCode=4xx')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res4xx).to.have.status(200);
    expect(res4xx.body.logs).to.have.length(2);
    res4xx.body.logs.forEach((log) => {
      expect(log.statusCode).to.be.at.least(400);
      expect(log.statusCode).to.be.below(500);
    });

    const res5xx = await chai
      .request(app)
      .get('/api/admin/logs?statusCode=5xx')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res5xx).to.have.status(200);
    expect(res5xx.body.logs).to.have.length(2);
    res5xx.body.logs.forEach((log) => {
      expect(log.statusCode).to.be.at.least(500);
    });

    const resExact = await chai
      .request(app)
      .get('/api/admin/logs?statusCode=404')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resExact).to.have.status(200);
    expect(resExact.body.logs).to.have.length(1);
    expect(resExact.body.logs[0].statusCode).to.equal(404);
  });

  // --- Filter by Date Range ---

  it('should filter logs by date range', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/test1',
        statusCode: 200,
        responseTime: 50,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/test2',
        statusCode: 200,
        responseTime: 60,
        timestamp: new Date('2024-01-05T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/test3',
        statusCode: 200,
        responseTime: 70,
        timestamp: new Date('2024-01-10T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/test4',
        statusCode: 200,
        responseTime: 80,
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    await ApiLog.insertMany(logsData);

    const startDate = '2024-01-05T00:00:00Z';
    const endDate = '2024-01-12T23:59:59Z';

    const res = await chai
      .request(app)
      .get(`/api/admin/logs?startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body.logs).to.have.length(2);

    const timestamps = res.body.logs.map((log) => new Date(log.timestamp));
    timestamps.forEach((timestamp) => {
      expect(timestamp.getTime()).to.be.at.least(new Date(startDate).getTime());
      expect(timestamp.getTime()).to.be.at.most(new Date(endDate).getTime());
    });
  });

  // --- Filter by User ---

  it('should filter logs by user ID', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/test1',
        statusCode: 200,
        responseTime: 50,
        userId: adminUser._id,
        userEmail: adminUser.email,
      },
      {
        method: 'GET',
        path: '/api/test2',
        statusCode: 200,
        responseTime: 60,
        userId: regularUser._id,
        userEmail: regularUser.email,
      },
      {
        method: 'GET',
        path: '/api/test3',
        statusCode: 200,
        responseTime: 70,
        userId: adminUser._id,
        userEmail: adminUser.email,
      },
    ];

    await ApiLog.insertMany(logsData);

    const res = await chai
      .request(app)
      .get(`/api/admin/logs?userId=${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body.logs).to.have.length(2);
    res.body.logs.forEach((log) => {
      expect(log.userId).to.equal(adminUser._id.toString());
    });
  });

  // --- Filter by Flags ---

  it('should filter logs by isSlow and isError flags', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/test1',
        statusCode: 200,
        responseTime: 50,
        isSlow: false,
        isError: false,
      },
      {
        method: 'GET',
        path: '/api/test2',
        statusCode: 200,
        responseTime: 2000,
        isSlow: true,
        isError: false,
      },
      {
        method: 'GET',
        path: '/api/test3',
        statusCode: 500,
        responseTime: 100,
        isSlow: false,
        isError: true,
      },
      {
        method: 'GET',
        path: '/api/test4',
        statusCode: 500,
        responseTime: 3000,
        isSlow: true,
        isError: true,
      },
    ];

    await ApiLog.insertMany(logsData);

    const resSlow = await chai
      .request(app)
      .get('/api/admin/logs?isSlow=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resSlow).to.have.status(200);
    expect(resSlow.body.logs).to.have.length(2);
    resSlow.body.logs.forEach((log) => {
      expect(log.isSlow).to.be.true;
    });

    const resError = await chai
      .request(app)
      .get('/api/admin/logs?isError=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resError).to.have.status(200);
    expect(resError.body.logs).to.have.length(2);
    resError.body.logs.forEach((log) => {
      expect(log.isError).to.be.true;
    });
  });

  // --- Search ---

  it('should search logs by path, user email, and IP address', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/users/search',
        statusCode: 200,
        responseTime: 50,
        userEmail: 'specific@example.com',
        ipAddress: '10.20.30.40',
      },
      {
        method: 'GET',
        path: '/api/issues/filter',
        statusCode: 200,
        responseTime: 60,
        userEmail: 'user@test.com',
        ipAddress: '192.168.1.2',
      },
      {
        method: 'POST',
        path: '/api/teams',
        statusCode: 201,
        responseTime: 70,
        userEmail: 'another@test.com',
        ipAddress: '192.168.1.5',
      },
    ];

    await ApiLog.insertMany(logsData);

    const resPath = await chai
      .request(app)
      .get('/api/admin/logs?search=10.20.30.40')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resPath).to.have.status(200);
    expect(resPath.body.logs.length).to.be.at.least(1);

    const matchingLog = resPath.body.logs.find((log) => log.ipAddress === '10.20.30.40');
    expect(matchingLog).to.exist;
    expect(matchingLog.path).to.include('users');
    expect(matchingLog.userEmail).to.equal('specific@example.com');
  });

  // --- Combined Filters ---

  it('should apply multiple filters simultaneously', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        responseTime: 50,
        userId: adminUser._id,
        timestamp: new Date('2024-01-05T10:00:00Z'),
      },
      {
        method: 'POST',
        path: '/api/issues',
        statusCode: 201,
        responseTime: 60,
        userId: adminUser._id,
        timestamp: new Date('2024-01-06T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/teams',
        statusCode: 404,
        responseTime: 70,
        userId: regularUser._id,
        timestamp: new Date('2024-01-07T10:00:00Z'),
        isError: true,
      },
    ];

    await ApiLog.insertMany(logsData);

    const res = await chai
      .request(app)
      .get(`/api/admin/logs?method=GET&userId=${adminUser._id}&statusCode=2xx`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res).to.have.status(200);
    expect(res.body.logs).to.have.length(1);
    expect(res.body.logs[0]).to.include({
      method: 'GET',
      statusCode: 200,
    });
    expect(res.body.logs[0].userId).to.equal(adminUser._id.toString());
  });

  // --- Sorting ---

  it('should sort logs by timestamp and responseTime with correct order', async () => {
    const logsData = [
      {
        method: 'GET',
        path: '/api/test1',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/test2',
        statusCode: 200,
        responseTime: 50,
        timestamp: new Date('2024-01-02T10:00:00Z'),
      },
      {
        method: 'GET',
        path: '/api/test3',
        statusCode: 200,
        responseTime: 150,
        timestamp: new Date('2024-01-03T10:00:00Z'),
      },
    ];

    await ApiLog.insertMany(logsData);

    const resDefault = await chai
      .request(app)
      .get('/api/admin/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resDefault).to.have.status(200);
    expect(resDefault.body.logs.length).to.be.at.least(3);

    const defaultPaths = resDefault.body.logs.map((log) => log.path);
    expect(defaultPaths).to.include('/api/test1');
    expect(defaultPaths).to.include('/api/test2');
    expect(defaultPaths).to.include('/api/test3');

    const timestamps = resDefault.body.logs.map((log) => new Date(log.timestamp).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).to.be.at.least(timestamps[i + 1]);
    }

    const resResponseTime = await chai
      .request(app)
      .get('/api/admin/logs?sortBy=responseTime&sortOrder=asc')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resResponseTime).to.have.status(200);
    expect(resResponseTime.body.logs.length).to.be.at.least(3);

    const rtPaths = resResponseTime.body.logs.map((log) => log.path);
    expect(rtPaths).to.include('/api/test1');
    expect(rtPaths).to.include('/api/test2');
    expect(rtPaths).to.include('/api/test3');

    const responseTimes = resResponseTime.body.logs.map((log) => log.responseTime);
    for (let i = 0; i < responseTimes.length - 1; i++) {
      expect(responseTimes[i]).to.be.at.most(responseTimes[i + 1]);
    }
  });
});
