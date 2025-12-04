// API endpoints for admin dashboard
const API_BASE = 'https://your-api-endpoint.com/admin';

export const adminAPI = {
  // User management
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/users`);
    return response.json();
  },
  
  // Content management
  getStories: async (status = 'pending') => {
    const response = await fetch(`${API_BASE}/stories?status=${status}`);
    return response.json();
  },
  
  // Analytics
  getAnalytics: async (period = 'monthly') => {
    const response = await fetch(`${API_BASE}/analytics?period=${period}`);
    return response.json();
  },
  
  // Reports
  getReports: async () => {
    const response = await fetch(`${API_BASE}/reports`);
    return response.json();
  }
};