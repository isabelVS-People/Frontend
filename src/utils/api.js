const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-62417.up.railway.app';

let _country = 'Chile';
let _token = null;

export const setApiCountry = (country) => { _country = country; };
export const setApiToken = (token) => { _token = token; };

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-country': _country,
    ...options.headers,
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const api = {
  employees: {
    list: () => request('/api/employees'),
    me: () => request('/api/employees/me'),
    update: (id, data) => request(`/api/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getRequirements: (id) => request(`/api/employees/${id}/requirements`),
    updateRequirements: (id, data) => request(`/api/employees/${id}/requirements`, { method: 'PUT', body: JSON.stringify(data) }),
    history: (id) => request(`/api/employees/${id}/history`),
  },
  roles: {
    families: () => request('/api/roles/families'),
    familyCompetencies: (familyId) => request(`/api/roles/families/${familyId}/competencies`),
    updateFamilyCompetency: (familyId, competencyName, level, description) =>
      request(`/api/roles/families/${familyId}/competencies/${encodeURIComponent(competencyName)}/${level}`, {
        method: 'PUT',
        body: JSON.stringify({ description }),
      }),
  },
  requirements: {
    list: () => request('/api/requirements'),
    create: (data) => request('/api/requirements', { method: 'POST', body: JSON.stringify(data) }),
  },
  bulk: {
    uploadEmployees: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const headers = { 'x-country': _country };
      if (_token) headers['Authorization'] = `Bearer ${_token}`;
      const res = await fetch(`${BASE_URL}/api/bulk/employees`, { method: 'POST', headers, body: form });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    uploadRoles: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const headers = { 'x-country': _country };
      if (_token) headers['Authorization'] = `Bearer ${_token}`;
      const res = await fetch(`${BASE_URL}/api/bulk/roles`, { method: 'POST', headers, body: form });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  export: {
    employees: () => window.open(`${BASE_URL}/api/export/employees`, '_blank'),
  },
};

export default api;
