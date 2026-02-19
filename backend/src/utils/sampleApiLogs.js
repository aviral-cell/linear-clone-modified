const logs = [
  {
    _id: '6996cf53b2d1677c5f720814',
    timestamp: '2026-02-19T08:52:35.853Z',
    method: 'POST',
    path: '/api/auth/login',
    statusCode: 200,
    responseTime: 542,
    userId: null,
    userEmail: null,
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      connection: 'keep-alive',
      'content-length': '55',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: { email: 'alex@workflow.dev', password: '[REDACTED]' },
    queryParams: {},
    responseBody: {
      message: 'Login successful',
      token: '[REDACTED]',
      user: {
        _id: '6996cf3f436d2ee7a71a736e',
        email: 'alex@workflow.dev',
        name: 'Alex Rivers',
        avatar: null,
        role: 'admin',
      },
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T08:52:35.855Z',
    updatedAt: '2026-02-19T08:52:35.855Z',
  },
  {
    _id: '6996e044c85eb7c2b8307f44',
    timestamp: '2026-02-19T10:04:52.824Z',
    method: 'GET',
    path: '/api/issues/my-issues?filter=subscribed',
    statusCode: 200,
    responseTime: 137,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: { filter: 'subscribed' },
    responseBody: {
      issues: [
        {
          _id: '6996cf40436d2ee7a71a761b',
          identifier: 'PRD-6',
          title: 'Analyze user analytics data',
          status: 'backlog',
          priority: 'low',
        },
      ],
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T10:04:52.827Z',
    updatedAt: '2026-02-19T10:04:52.827Z',
  },
  {
    _id: '6996e77b986c12c45caca68d',
    timestamp: '2026-02-19T10:35:39.683Z',
    method: 'GET',
    path: '/api/admin/logs?page=1&limit=50',
    statusCode: 200,
    responseTime: 26,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: { page: '1', limit: '50' },
    responseBody: {
      _truncated: true,
      _originalSize: 14071,
      _preview: '{"logs":[...]...[TRUNCATED]',
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T10:35:39.687Z',
    updatedAt: '2026-02-19T10:35:39.687Z',
  },
  {
    _id: '6996ddaf9a07c5e76db1d9f8',
    timestamp: '2026-02-19T09:53:51.410Z',
    method: 'GET',
    path: '/api/projects?teamId=6996cf3f436d2ee7a71a7385',
    statusCode: 200,
    responseTime: 183,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: { teamId: '6996cf3f436d2ee7a71a7385' },
    responseBody: {
      projects: [
        { _id: '6996cf3f436d2ee7a71a73a5', name: 'Product Metrics Dashboard', status: 'planned' },
        {
          _id: '6996cf3f436d2ee7a71a73a3',
          name: 'Competitive Analysis Framework',
          status: 'planned',
        },
        {
          _id: '6996cf3f436d2ee7a71a73a1',
          name: 'User Feedback Integration',
          status: 'in_progress',
        },
        { _id: '6996cf3f436d2ee7a71a739f', name: '2025 Product Roadmap', status: 'in_progress' },
      ],
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T09:53:51.416Z',
    updatedAt: '2026-02-19T09:53:51.416Z',
  },
  {
    _id: '6996ced86a2782aa7dfeb5b6',
    timestamp: '2026-02-19T08:50:32.328Z',
    method: 'DELETE',
    path: '/api/issues/DES-12/comments/6996b796e73ec207b92d86eb',
    statusCode: 200,
    responseTime: 75,
    userId: '6996b764f06a98009db51ad1',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: {},
    responseBody: { message: 'Comment deleted successfully' },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T08:50:32.330Z',
    updatedAt: '2026-02-19T08:50:32.330Z',
  },
  {
    _id: '6996cf53b2d1677c5f72081c',
    timestamp: '2026-02-19T08:52:35.909Z',
    method: 'GET',
    path: '/api/teams',
    statusCode: 200,
    responseTime: 35,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: {},
    responseBody: {
      teams: [
        { _id: '6996cf3f436d2ee7a71a7381', name: 'Design', key: 'DES' },
        { _id: '6996cf3f436d2ee7a71a737f', name: 'Engineering', key: 'ENG' },
        { _id: '6996cf3f436d2ee7a71a7383', name: 'Marketing', key: 'MKT' },
        { _id: '6996cf3f436d2ee7a71a7385', name: 'Product', key: 'PRD' },
      ],
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T08:52:35.912Z',
    updatedAt: '2026-02-19T08:52:35.912Z',
  },
  {
    _id: '6996cf5cb2d1677c5f7208e8',
    timestamp: '2026-02-19T08:52:44.890Z',
    method: 'POST',
    path: '/api/issues/DES-12/comments',
    statusCode: 201,
    responseTime: 37,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      'content-length': '21',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: { content: 'Comment' },
    queryParams: {},
    responseBody: {
      comment: {
        issue: '6996cf40436d2ee7a71a75df',
        user: { _id: '6996cf3f436d2ee7a71a736e', email: 'alex@workflow.dev', name: 'Alex Rivers' },
        content: 'Comment',
        isEdited: false,
        _id: '6996cf5cb2d1677c5f7208e3',
      },
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T08:52:44.891Z',
    updatedAt: '2026-02-19T08:52:44.891Z',
  },
  {
    _id: '6996df1ae533705b11a9fd37',
    timestamp: '2026-02-19T09:59:54.731Z',
    method: 'GET',
    path: '/api/issues/my-issues?filter=subscribed',
    statusCode: 400,
    responseTime: 11,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: { filter: 'subscribed' },
    responseBody: { message: 'Filter is required' },
    errorMessage: 'Filter is required',
    errorStack: null,
    isSlow: false,
    isError: true,
    createdAt: '2026-02-19T09:59:54.732Z',
    updatedAt: '2026-02-19T09:59:54.732Z',
  },
  {
    _id: '6996e75c9341093d8dfd5da3',
    timestamp: '2026-02-19T10:35:08.632Z',
    method: 'GET',
    path: '/api/auth/me',
    statusCode: 304,
    responseTime: 43,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::ffff:127.0.0.1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: {},
    responseBody: {
      user: {
        _id: '6996cf3f436d2ee7a71a736e',
        email: 'alex@workflow.dev',
        name: 'Alex Rivers',
        avatar: null,
        role: 'admin',
      },
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T10:35:08.636Z',
    updatedAt: '2026-02-19T10:35:08.636Z',
  },
  {
    _id: '6996e77b986c12c45caca688',
    timestamp: '2026-02-19T10:35:39.632Z',
    method: 'GET',
    path: '/api/admin/logs?page=1&limit=50',
    statusCode: 200,
    responseTime: 93,
    userId: '6996cf3f436d2ee7a71a736e',
    userEmail: 'alex@workflow.dev',
    ipAddress: '::1',
    userAgent:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36 Edg/144.0.0.0',
    requestHeaders: {
      host: 'localhost:8080',
      authorization: '[REDACTED]',
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'http://localhost:8000',
      referer: 'http://localhost:8000/',
    },
    requestBody: null,
    queryParams: { page: '1', limit: '50' },
    responseBody: {
      _truncated: true,
      _originalSize: 14050,
      _preview: '{"logs":[...]...[TRUNCATED]',
    },
    errorMessage: null,
    errorStack: null,
    isSlow: false,
    isError: false,
    createdAt: '2026-02-19T10:35:39.650Z',
    updatedAt: '2026-02-19T10:35:39.650Z',
  },
];

const LIST_FIELDS = [
  '_id',
  'timestamp',
  'method',
  'path',
  'statusCode',
  'responseTime',
  'userEmail',
  'userId',
  'ipAddress',
  'isSlow',
  'isError',
];

const pick = (obj, fields) =>
  fields.reduce((acc, f) => {
    if (f in obj) acc[f] = obj[f];
    return acc;
  }, {});

export const getSampleLogs = (filters = {}) => {
  const {
    page = 1,
    limit = 50,
    method,
    statusCode,
    search,
    isSlow,
    isError,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = filters;

  let filtered = [...logs];

  if (method) {
    filtered = filtered.filter((l) => l.method === method.toUpperCase());
  }

  if (isSlow === 'true') {
    filtered = filtered.filter((l) => l.isSlow);
  }

  if (isError === 'true') {
    filtered = filtered.filter((l) => l.isError);
  }

  if (statusCode) {
    if (statusCode === '2xx')
      filtered = filtered.filter((l) => l.statusCode >= 200 && l.statusCode < 300);
    else if (statusCode === '3xx')
      filtered = filtered.filter((l) => l.statusCode >= 300 && l.statusCode < 400);
    else if (statusCode === '4xx')
      filtered = filtered.filter((l) => l.statusCode >= 400 && l.statusCode < 500);
    else if (statusCode === '5xx') filtered = filtered.filter((l) => l.statusCode >= 500);
    else filtered = filtered.filter((l) => l.statusCode === parseInt(statusCode, 10));
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filtered = filtered.filter(
      (l) => regex.test(l.path) || regex.test(l.userEmail || '') || regex.test(l.ipAddress || '')
    );
  }

  const dir = sortOrder === 'asc' ? 1 : -1;
  filtered.sort((a, b) => (a[sortBy] > b[sortBy] ? dir : -dir));

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const paged = filtered.slice(skip, skip + limitNum).map((l) => pick(l, LIST_FIELDS));
  const totalPages = Math.ceil(filtered.length / limitNum);

  return {
    logs: paged,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalLogs: filtered.length,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

export const getSampleLogById = (logId) => logs.find((l) => l._id === logId) || null;
