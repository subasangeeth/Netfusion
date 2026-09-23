import { mockService } from './mockService';

/**
 * NetFusion Central API Layer
 * 
 * In development / capstone evaluation mode, USE_MOCK defaults to true.
 * When your teammate deploys the real AWS/Flask/FastAPI/Express backend,
 * toggle USE_MOCK to false and configure VITE_API_URL in .env.
 * 
 * The UI layer NEVER calls mock data directly; it only invokes `api.*` methods.
 */
export const API_CONFIG = {
  USE_MOCK: true,
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
};

// Helper for real HTTP requests when USE_MOCK is false
async function request(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[NetFusion API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Toggle mock mode at runtime (e.g. from topbar controls)
  isMockMode() {
    return API_CONFIG.USE_MOCK;
  },

  setMockMode(enabled) {
    API_CONFIG.USE_MOCK = enabled;
  },

  getBaseUrl() {
    return API_CONFIG.BASE_URL;
  },

  // Overview Page
  async getOverview() {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getOverview();
    }
    return request('/overview');
  },

  // Infrastructure Page
  async getDevices(params) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getDevices(params);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/devices${query ? `?${query}` : ''}`);
  },

  async getDeviceById(id) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getDeviceById(id);
    }
    return request(`/devices/${id}`);
  },

  // Network Page
  async getNetwork() {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getNetwork();
    }
    return request('/network');
  },

  // Cloud Page (Teammate's AWS backend)
  async getCloud() {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getCloud();
    }
    return request('/cloud');
  },

  // Alerts Page
  async getAlerts(params) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getAlerts(params);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/alerts${query ? `?${query}` : ''}`);
  },

  async acknowledgeAlert(alertId, user) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.acknowledgeAlert(alertId, user);
    }
    return request(`/alerts/${alertId}/ack`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgedBy: user })
    });
  },

  async resolveAlert(alertId) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.resolveAlert(alertId);
    }
    return request(`/alerts/${alertId}/resolve`, {
      method: 'POST'
    });
  },

  // Logs Page
  async getLogs(params) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getLogs(params);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/logs${query ? `?${query}` : ''}`);
  },

  // Metrics for time-series charts
  async getMetrics() {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getMetrics();
    }
    return request('/metrics');
  },

  // Troubleshooting / Diagnostics Assistant
  async getDiagnostics(deviceKey) {
    if (API_CONFIG.USE_MOCK) {
      return mockService.getDiagnostics(deviceKey);
    }
    return request(`/troubleshooting/${deviceKey}`);
  }
};

export default api;
