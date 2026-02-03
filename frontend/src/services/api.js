/**
 * Centralized API Service
 * Handles all HTTP requests with consistent error handling and authentication
 */

// Generate base URL dynamically based on current location
const generateBaseURL = () => {
  const currentHost = window?.location?.host || 'localhost:8000';
  const currentProtocol = window?.location?.protocol || 'http:';
  return `${currentProtocol}//${currentHost.replace('8000', '8080')}`;
};

// API Error class for consistent error handling
export class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isApiError = true;
  }
}

// API Service class
class ApiService {
  constructor() {
    this.baseURL = generateBaseURL();
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Core request method
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

      // Handle non-JSON responses
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

      // Return parsed JSON or null for empty responses
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

  // HTTP method helpers
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

  // ==================
  // AUTH ENDPOINTS
  // ==================
  auth = {
    getCurrentUser: () => this.get('/api/auth/me'),

    login: (email, password) => this.post('/api/auth/login', { email, password }),

    register: (email, password, name) => this.post('/api/auth/register', { email, password, name }),
  };

  // ==================
  // TEAMS ENDPOINTS
  // ==================
  teams = {
    getAll: () => this.get('/api/teams'),
  };

  // ==================
  // USERS ENDPOINTS
  // ==================
  users = {
    getAll: () => this.get('/api/users'),
  };

  // ==================
  // PROJECTS ENDPOINTS
  // ==================
  projects = {
    getByTeam: (teamId) => this.get(`/api/projects?teamId=${teamId}`),

    getByIdentifier: (identifier) => this.get(`/api/projects/${identifier}`),

    update: (identifier, data) => this.put(`/api/projects/${identifier}`, data),

    getIssues: (identifier) => this.get(`/api/projects/${identifier}/issues`),

    getUpdates: (identifier) => this.get(`/api/projects/${identifier}/updates`),

    getActivities: (identifier) => this.get(`/api/projects/${identifier}/activities`),
  };

  // ==================
  // ISSUES ENDPOINTS
  // ==================
  issues = {
    getByIdentifier: (identifier) => this.get(`/api/issues/${identifier}`),

    getByTeam: (teamId, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return this.get(`/api/issues/team/${teamId}${q ? `?${q}` : ''}`);
    },

    create: (data) => this.post('/api/issues', data),

    update: (identifier, data) => this.put(`/api/issues/${identifier}`, data),

    getValidParents: (identifier) => this.get(`/api/issues/${identifier}/valid-parents`),
  };

  // ==================
  // COMMENTS ENDPOINTS
  // ==================
  comments = {
    getByIssue: (issueId) => this.get(`/api/comments/issue/${issueId}`),

    create: (issueId, content) => this.post(`/api/comments/issue/${issueId}`, { content }),

    update: (commentId, content) => this.put(`/api/comments/${commentId}`, { content }),

    delete: (commentId) => this.delete(`/api/comments/${commentId}`),
  };

  // ==================
  // ISSUE ACTIVITIES ENDPOINTS
  // ==================
  issueActivities = {
    getByIssue: (issueId) => this.get(`/api/activities/issue/${issueId}`),
  };
}

// Export singleton instance
export const api = new ApiService();

// Export baseURL for backward compatibility during migration
export const baseURL = generateBaseURL();

export default api;
