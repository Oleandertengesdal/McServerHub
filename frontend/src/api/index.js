import api from './client';

// ─── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }),

  me: () => api.get('/auth/me'),
};

// ─── Servers ─────────────────────────────────────────────────────────
export const serverApi = {
  list: (page = 0, size = 20) =>
    api.get('/servers', { params: { page, size } }),

  get: (id) => api.get(`/servers/${id}`),

  create: (data) => api.post('/servers', data),

  update: (id, data) => api.put(`/servers/${id}`, data),

  delete: (id) => api.delete(`/servers/${id}`),

  start: (id) => api.post(`/servers/${id}/start`),

  stop: (id, force = false) =>
    api.post(`/servers/${id}/stop`, null, { params: { force } }),

  restart: (id) => api.post(`/servers/${id}/restart`),

  executeCommand: (id, command) =>
    api.post(`/servers/${id}/command`, { command }),
};

// ─── Backups ─────────────────────────────────────────────────────────
export const backupApi = {
  list: (serverId, page = 0, size = 20) =>
    api.get(`/servers/${serverId}/backups`, { params: { page, size } }),

  get: (backupId) => api.get(`/backups/${backupId}`),

  create: (serverId, data) =>
    api.post(`/servers/${serverId}/backups`, data),

  delete: (backupId) => api.delete(`/backups/${backupId}`),

  verify: (backupId) => api.post(`/backups/${backupId}/verify`),
};

// ─── Restore ─────────────────────────────────────────────────────────
export const restoreApi = {
  restore: (serverId, backupId, safetyBackup = true) =>
    api.post(`/servers/${serverId}/restore/${backupId}`, null, {
      params: { safetyBackup },
    }),
};

// ─── Backup Schedules ────────────────────────────────────────────────
export const scheduleApi = {
  list: (serverId) =>
    api.get(`/servers/${serverId}/schedules`),

  create: (serverId, data) =>
    api.post(`/servers/${serverId}/schedules`, data),

  toggle: (scheduleId, enabled) =>
    api.put(`/schedules/${scheduleId}/toggle`, null, {
      params: { enabled },
    }),

  delete: (scheduleId) => api.delete(`/schedules/${scheduleId}`),
};

// ─── Metrics ─────────────────────────────────────────────────────────
export const metricsApi = {
  list: (serverId, page = 0, size = 100) =>
    api.get(`/servers/${serverId}/metrics`, { params: { page, size } }),

  latest: (serverId) =>
    api.get(`/servers/${serverId}/metrics/latest`),

  range: (serverId, from, to) =>
    api.get(`/servers/${serverId}/metrics/range`, {
      params: { from, to },
    }),
};
