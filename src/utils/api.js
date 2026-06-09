const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-production-62417.up.railway.app';

let _country = 'Chile';

export const setApiCountry = (country) => { _country = country; };

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 
      'Content-Type': 'application/json',
      'x-country': _country,
      ...options.headers 
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const api = {
  employees: {
    list: () => request('/api/employees'),
    update: (id, data) => request(`/api/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getRequirements: (id) => request(`/api/employees/${id}/requirements`),
    updateRequirements: (id, data) => request(`/api/employees/${id}/requirements`, { method: 'PUT', body: JSON.stringify(data) }),
    history: (id) => request(`/api/employees/${id}/history`),
  },
  roles: {
    families: () => request('/api/roles/families'),
  },
  requirements: {
    list: () => request('/api/requirements'),
    create: (data) => request('/api/requirements', { method: 'POST', body: JSON.stringify(data) }),
  },
  bulk: {
    uploadEmployees: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE_URL}/api/bulk/employees`, { 
        method: 'POST', 
        headers: { 'x-country': _country },
        body: form 
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  export: {
    employees: () => window.open(`${BASE_URL}/api/export/employees`, '_blank'),
  },
};

export default api;