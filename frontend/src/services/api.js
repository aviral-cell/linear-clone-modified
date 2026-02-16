/**
 * Centralized API Service
 * Handles all HTTP requests with consistent error handling and authentication
 */

const generateBaseURL = () => {
  const currentHost = window?.location?.host || 'localhost:8000';
  const currentProtocol = window?.location?.protocol || 'http:';
  return `${currentProtocol}//${currentHost.replace('8000', '8080')}`;
};

export class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isApiError = true;
  }
}

class ApiService {
  constructor() {
    this.baseURL = generateBaseURL();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Request failed';
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }
        throw new ApiError(errorMessage, response.status);
      }

      if (isJson) {
        return await response.json();
      }
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  auth = {
    getCurrentUser: () => this.get('/api/auth/me'),

    login: (email, password) => this.post('/api/auth/login', { email, password }),

    register: (email, password, name) => this.post('/api/auth/register', { email, password, name }),
  };

  teams = {
    getAll: () => this.get('/api/teams'),
  };

  users = {
    getAll: () => this.get('/api/users'),
  };

  projects = {
    getByTeam: (teamId) => this.get(`/api/projects?teamId=${teamId}`),

    getByIdentifier: (identifier) => this.get(`/api/projects/${identifier}`),

    update: (identifier, data) => this.put(`/api/projects/${identifier}`, data),

    getIssues: (identifier) => this.get(`/api/projects/${identifier}/issues`),

    getUpdates: (identifier) => this.get(`/api/projects/${identifier}/updates`),

    getActivities: (identifier) => this.get(`/api/projects/${identifier}/activities`),
  };

  issues = {
    getByIdentifier: (identifier) => this.get(`/api/issues/${identifier}`),

    getByTeam: (teamId, params = {}) => {
      const q = new URLSearchParams({ teamId, ...params }).toString();
      return this.get(`/api/issues?${q}`);
    },

    create: (data) => this.post('/api/issues', data),

    update: (identifier, data) => this.put(`/api/issues/${identifier}`, data),

    getValidParents: (identifier) => this.get(`/api/issues/${identifier}/valid-parents`),

    toggleSubscribe: (identifier) => this.post(`/api/issues/${identifier}/subscribe`),
  };

  comments = {
    getByIssue: (identifier) => this.get(`/api/issues/${identifier}/comments`),

    create: (identifier, content) => this.post(`/api/issues/${identifier}/comments`, { content }),

    update: (identifier, commentId, content) =>
      this.put(`/api/issues/${identifier}/comments/${commentId}`, { content }),

    delete: (identifier, commentId) =>
      this.delete(`/api/issues/${identifier}/comments/${commentId}`),
  };

  issueActivities = {
    getByIssue: (identifier) => this.get(`/api/issues/${identifier}/activities`),
  };
}

export const api = new ApiService();

export const baseURL = generateBaseURL();

export default api;
