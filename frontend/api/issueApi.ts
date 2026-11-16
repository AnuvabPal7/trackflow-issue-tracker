import { axiosClient } from './axiosClient';
import { Issue, IssuePriority, IssueStatus } from '../types';
import { INITIAL_ISSUES } from '../data/mockData';

const STORAGE_KEY = 'trackflow_issues_v3';
export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

const getLocalIssues = (): Issue[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local issues', e);
  }
  return INITIAL_ISSUES;
};

const saveLocalIssues = (issues: Issue[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
};

// The backend does not send every field the UI uses (e.g. activityLogs), so fill safe defaults.
const normalizeIssue = (i: Issue): Issue => ({
  ...i,
  description: i.description ?? '',
  labels: i.labels ?? [],
  components: i.components ?? [],
  comments: i.comments ?? [],
  attachments: i.attachments ?? [],
  activityLogs: i.activityLogs ?? [],
});

export interface IssueFilterParams {
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const issueApi = {
  getIssuesByProject: async (projectId: string, filters?: IssueFilterParams): Promise<Issue[]> => {
    if (isMockMode) {
      let issues = getLocalIssues().filter((i) => i.projectId === projectId);
      if (filters?.status) issues = issues.filter((i) => i.status === filters.status);
      if (filters?.priority) issues = issues.filter((i) => i.priority === filters.priority);
      if (filters?.assigneeId && filters.assigneeId !== 'ALL') {
        issues = issues.filter((i) => i.assigneeId === filters.assigneeId);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        issues = issues.filter(
            (i) =>
                i.key.toLowerCase().includes(q) ||
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
        );
      }
      return issues;
    }

    const params: Record<string, string | number> = { projectId };
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.assigneeId && filters.assigneeId !== 'ALL' && filters.assigneeId !== 'UNASSIGNED') {
      params.assigneeId = filters.assigneeId;
    }
    if (filters?.search) params.search = filters.search;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.size !== undefined) params.size = filters.size;

    const response = await axiosClient.get<Issue[]>('/issues', { params });
    return response.data.map(normalizeIssue);
  },

  createIssue: async (
      data: Omit<Issue, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'activityLogs'>,
      projectKey: string
  ): Promise<Issue> => {
    if (isMockMode) {
      const all = getLocalIssues();
      const projIssues = all.filter((i) => i.projectId === data.projectId);
      const nextNum = 100 + projIssues.length + 1;
      const key = `${projectKey}-${nextNum}`;

      const newIssue: Issue = {
        ...data,
        id: `iss-${Date.now()}`,
        key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        attachments: [],
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            userId: data.reporterId,
            action: `Created issue ${key}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      saveLocalIssues([newIssue, ...all]);
      return newIssue;
    }

    const response = await axiosClient.post<Issue>('/issues', data);
    return normalizeIssue(response.data);
  },

  updateIssue: async (id: string, updates: Partial<Issue>, userId?: string): Promise<Issue> => {
    if (isMockMode) {
      const all = getLocalIssues();
      const updated = all.map((issue) => {
        if (issue.id !== id) return issue;
        const newLogs = [...issue.activityLogs];
        if (updates.status && updates.status !== issue.status) {
          newLogs.push({
            id: `act-${Date.now()}`,
            userId: userId || issue.reporterId,
            action: `Transitioned status from ${issue.status} to ${updates.status}`,
            timestamp: new Date().toISOString(),
          });
        }
        return {
          ...issue,
          ...updates,
          updatedAt: new Date().toISOString(),
          activityLogs: newLogs,
        };
      });
      saveLocalIssues(updated);
      return updated.find((i) => i.id === id)!;
    }

    const response = await axiosClient.put<Issue>(`/issues/${id}`, updates);
    return normalizeIssue(response.data);
  },

  transitionStatus: async (id: string, newStatus: IssueStatus, userId?: string): Promise<void> => {
    if (isMockMode) {
      const all = getLocalIssues();
      const updated = all.map((i) =>
          i.id === id ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i
      );
      saveLocalIssues(updated);
      return;
    }

    await axiosClient.put(`/issues/${id}/status`, { status: newStatus });
  },

  deleteIssue: async (id: string): Promise<void> => {
    if (isMockMode) {
      const all = getLocalIssues();
      saveLocalIssues(all.filter((i) => i.id !== id));
      return;
    }

    await axiosClient.delete(`/issues/${id}`);
  },
};