const trimTrailingSlash = (value) => value?.replace(/\/$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
);

export const SOCKET_SERVER_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL
);

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

export const getProjects = () => request('/api/projects');

export const getProject = (id) => request(`/api/projects/${id}`);

export const createProject = (project) => request('/api/projects', {
  method: 'POST',
  body: JSON.stringify(project),
});

export const deleteProject = (id) => request(`/api/projects/${id}`, {
  method: 'DELETE',
});

export const addProjectMaterial = (projectId, material) => request(`/api/projects/${projectId}/materials`, {
  method: 'POST',
  body: JSON.stringify(material),
});

export const deleteProjectMaterial = (projectId, materialId) => request(`/api/projects/${projectId}/materials/${materialId}`, {
  method: 'DELETE',
});
