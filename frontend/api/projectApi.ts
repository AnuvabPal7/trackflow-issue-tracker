import { axiosClient } from './axiosClient';
import { Project, ProjectMember } from '../types';
import { INITIAL_PROJECTS } from '../data/mockData';

const STORAGE_KEY = 'trackflow_projects_v3';
export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

const getLocalProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local projects', e);
  }
  return INITIAL_PROJECTS;
};

const saveLocalProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    if (isMockMode) {
      return getLocalProjects();
    }
    const response = await axiosClient.get<Project[]>('/projects');
    return response.data;
  },

  getProjectByKey: async (key: string): Promise<Project | null> => {
    if (isMockMode) {
      const all = getLocalProjects();
      return all.find((p) => p.key.toUpperCase() === key.toUpperCase()) || null;
    }
    const response = await axiosClient.get<Project>(`/projects/${key}`);
    return response.data;
  },

  createProject: async (data: { name: string; key: string; description: string; leadId: string }): Promise<Project> => {
    if (isMockMode) {
      const all = getLocalProjects();
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description,
        leadId: data.leadId,
        issueCountSequence: 1,
        createdAt: new Date().toISOString(),
        members: [{ userId: data.leadId, role: 'ADMIN', joinedAt: new Date().toISOString() }],
      };
      saveLocalProjects([...all, newProj]);
      return newProj;
    }
    const response = await axiosClient.post<Project>('/projects', data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    if (isMockMode) {
      const all = getLocalProjects();
      saveLocalProjects(all.filter((p) => p.id !== id));
      return;
    }
    await axiosClient.delete(`/projects/${id}`);
  },

  updateProjectMembers: async (projectId: string, members: ProjectMember[]): Promise<Project> => {
    if (isMockMode) {
      const all = getLocalProjects();
      const updated = all.map((p) => (p.id === projectId ? { ...p, members } : p));
      saveLocalProjects(updated);
      return updated.find((p) => p.id === projectId)!;
    }
    const response = await axiosClient.put<Project>(`/projects/${projectId}/members`, { members });
    return response.data;
  },
};

