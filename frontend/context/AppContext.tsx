import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Project,
  Issue,
  IssueStatus,
  FilterState,
  ProjectMember,
} from '../types';
import { authApi } from '../api/authApi';
import { projectApi } from '../api/projectApi';
import { userApi, isMockMode } from '../api/userApi';
import { issueApi } from '../api/issueApi';
import { commentApi } from '../api/commentApi';
import { attachmentApi, FileUploadPayload } from '../api/attachmentApi';
import { INITIAL_USERS } from '../data/mockData';
import { ToastContainer, ToastItem } from '../components/ToastContainer';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, department?: string, title?: string) => Promise<void>;
  logout: () => void;
  users: User[];

  // Projects
  projects: Project[];
  currentProject: Project | null;
  setCurrentProjectKey: (key: string) => void;
  createProject: (name: string, key: string, description: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectMembers: (projectId: string, members: ProjectMember[]) => Promise<void>;

  // Issues
  issues: Issue[];
  currentProjectIssues: Issue[];
  filteredIssues: Issue[];
  createIssue: (issueData: Omit<Issue, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'activityLogs'>) => Promise<Issue>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<boolean>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;

  // Comments & Attachments
  addComment: (issueId: string, content: string) => Promise<void>;
  deleteComment: (issueId: string, commentId: string) => Promise<void>;
  addAttachment: (issueId: string, file: FileUploadPayload) => Promise<void>;
  deleteAttachment: (issueId: string, attachmentId: string) => Promise<void>;

  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Dialogs
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isCreateIssueOpen: boolean;
  setIsCreateIssueOpen: (open: boolean) => void;
  isProjectSettingsOpen: boolean;
  setIsProjectSettingsOpen: (open: boolean) => void;
  isNewProjectOpen: boolean;
  setIsNewProjectOpen: (open: boolean) => void;

  // Role permissions
  canEditIssue: (issue: Issue) => boolean;
  canDeleteIssue: (issue: Issue) => boolean;
  canDeleteProject: () => boolean;
  canManageProject: () => boolean;

  // Toasts
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;

  isLoading: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  types: [],
  priorities: [],
  statuses: [],
  assigneeId: 'ALL',
  quickFilter: 'ALL',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('trackflow_user');
    const token = localStorage.getItem('trackflow_token');
    if (raw && token) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    // Only the offline mock mode starts with a demo user; real mode requires a login.
    return isMockMode ? INITIAL_USERS[0] : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectKey, setCurrentProjectKey] = useState<string>('CORE');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Modals
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Load project list and then load issues for active project
  const refreshData = useCallback(async () => {
    // Not logged in: nothing to load (avoids 401 errors on the login page)
    if (!localStorage.getItem('trackflow_token')) {
      setProjects([]);
      setIssues([]);
      setUsers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedUsers = await userApi.getUsers();
      setUsers(fetchedUsers);

      const fetchedProjects = await projectApi.getProjects();
      setProjects(fetchedProjects);

      const activeProject =
          fetchedProjects.find((p) => p.key.toUpperCase() === currentProjectKey.toUpperCase()) ||
          fetchedProjects[0] ||
          null;

      if (activeProject) {
        if (activeProject.key !== currentProjectKey) {
          setCurrentProjectKey(activeProject.key);
        }
        // Load issues per project using backend filter/pagination endpoint
        const fetchedIssues = await issueApi.getIssuesByProject(activeProject.id);
        setIssues(fetchedIssues);
      } else {
        setIssues([]);
      }
    } catch (e: any) {
      console.error('Failed to load project data', e);
      showToast(e?.message || 'Failed to load projects. Please verify backend connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectKey, showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentProject = useMemo(() => {
    return (
        projects.find((p) => p.key.toUpperCase() === currentProjectKey.toUpperCase()) ||
        projects[0] ||
        null
    );
  }, [projects, currentProjectKey]);

  // Load issues when switching projects
  const handleSelectProjectKey = useCallback(
      async (key: string) => {
        setCurrentProjectKey(key);
        const proj = projects.find((p) => p.key.toUpperCase() === key.toUpperCase());
        if (proj) {
          try {
            setIsLoading(true);
            const fetchedIssues = await issueApi.getIssuesByProject(proj.id);
            setIssues(fetchedIssues);
          } catch (e: any) {
            showToast(e?.message || `Failed to load issues for project ${key}`, 'error');
          } finally {
            setIsLoading(false);
          }
        }
      },
      [projects, showToast]
  );

  const login = async (email: string, pass: string) => {
    try {
      const res = await authApi.login({ email, password: pass });
      setCurrentUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      await refreshData();
    } catch (e: any) {
      showToast(e?.message || 'Login failed. Please check your credentials.', 'error');
      throw e;
    }
  };

  const register = async (
      name: string,
      email: string,
      pass: string,
      department?: string,
      title?: string
  ) => {
    try {
      const res = await authApi.register({
        fullName: name,
        email,
        password: pass,
        department,
        title,
      });
      setCurrentUser(res.user);
      showToast(`Account created successfully as Developer!`, 'success');
      await refreshData();
    } catch (e: any) {
      showToast(e?.message || 'Registration failed.', 'error');
      throw e;
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    setProjects([]);
    setIssues([]);
    setUsers([]);
    showToast('You have been logged out.', 'info');
  };

  // Role permissions rules
  const canEditIssue = (issue: Issue): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') return true;
    if (currentUser.role === 'DEVELOPER') {
      return issue.assigneeId === currentUser.id || issue.reporterId === currentUser.id;
    }
    return false;
  };

  const canDeleteIssue = (_issue: Issue): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') return true;
    return false; // DEVELOPER cannot delete issues
  };

  const canDeleteProject = (): boolean => {
    return currentUser?.role === 'ADMIN';
  };

  const canManageProject = (): boolean => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  };

  const createProject = async (name: string, key: string, description: string): Promise<Project> => {
    if (!canDeleteProject() && !canManageProject()) {
      showToast('Permission denied: only managers and administrators can create projects.', 'error');
      throw new Error('Only managers and administrators can create projects.');
    }
    try {
      const newProj = await projectApi.createProject({
        name,
        key,
        description,
        leadId: currentUser?.id || 'usr-1',
      });
      setProjects((prev) => [...prev, newProj]);
      setCurrentProjectKey(newProj.key);
      showToast(`Project ${newProj.name} created!`, 'success');
      return newProj;
    } catch (e: any) {
      showToast(e?.message || 'Failed to create project', 'error');
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    if (!canDeleteProject()) {
      showToast('Permission denied: only administrators can delete projects.', 'error');
      throw new Error('Only administrators can delete projects.');
    }
    try {
      await projectApi.deleteProject(id);
      setProjects((prev) => {
        const remaining = prev.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          setCurrentProjectKey(remaining[0].key);
        }
        return remaining;
      });
      showToast('Project deleted successfully.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete project', 'error');
      throw e;
    }
  };

  const updateProjectMembers = async (projectId: string, members: ProjectMember[]) => {
    if (!canManageProject()) {
      showToast('Permission denied: cannot manage project members.', 'error');
      throw new Error('Permission denied: cannot manage project members.');
    }
    try {
      const updated = await projectApi.updateProjectMembers(projectId, members);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      showToast('Project members updated.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to update project members', 'error');
      throw e;
    }
  };

  const createIssue = async (
      issueData: Omit<Issue, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'activityLogs'>
  ): Promise<Issue> => {
    const proj = projects.find((p) => p.id === issueData.projectId) || currentProject;
    const projectKey = proj ? proj.key : 'CORE';
    try {
      const newIssue = await issueApi.createIssue(issueData, projectKey);
      setIssues((prev) => [newIssue, ...prev]);
      showToast(`Issue ${newIssue.key} created!`, 'success');
      return newIssue;
    } catch (e: any) {
      showToast(e?.message || 'Failed to create issue', 'error');
      throw e;
    }
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    const target = issues.find((i) => i.id === issueId);
    if (target && !canEditIssue(target)) {
      showToast('Permission denied: Developers can edit only issues assigned to or reported by them.', 'error');
      throw new Error('Developers can only edit issues assigned to or reported by them.');
    }
    try {
      const updated = await issueApi.updateIssue(issueId, updates, currentUser?.id);
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
    } catch (e: any) {
      showToast(e?.message || 'Failed to update issue', 'error');
      throw e;
    }
  };

  const deleteIssue = async (issueId: string): Promise<boolean> => {
    const target = issues.find((i) => i.id === issueId);
    if (!target || !canDeleteIssue(target)) {
      showToast('Permission denied: Role cannot delete issues.', 'error');
      return false;
    }
    try {
      await issueApi.deleteIssue(issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      if (selectedIssueId === issueId) {
        setSelectedIssueId(null);
      }
      showToast(`Issue ${target.key} deleted.`, 'success');
      return true;
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete issue', 'error');
      return false;
    }
  };

  const moveIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;
    const previousStatus = target.status;
    // Optimistic UI update
    setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i))
    );
    try {
      await issueApi.transitionStatus(issueId, newStatus, currentUser?.id);
    } catch (e: any) {
      // Revert optimistic update on failure
      setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? { ...i, status: previousStatus } : i))
      );
      showToast(e?.message || `Failed to transition issue status to ${newStatus}`, 'error');
    }
  };

  const addComment = async (issueId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    try {
      const newComm = await commentApi.addComment(issueId, content, currentUser.id);
      setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? { ...i, comments: [...i.comments, newComm] } : i))
      );
    } catch (e: any) {
      showToast(e?.message || 'Failed to post comment', 'error');
    }
  };

  const deleteComment = async (issueId: string, commentId: string) => {
    try {
      await commentApi.deleteComment(issueId, commentId);
      setIssues((prev) =>
          prev.map((i) =>
              i.id === issueId ? { ...i, comments: i.comments.filter((c) => c.id !== commentId) } : i
          )
      );
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete comment', 'error');
    }
  };

  const addAttachment = async (issueId: string, file: FileUploadPayload) => {
    try {
      const newAtt = await attachmentApi.uploadAttachment(issueId, file, currentUser?.name || 'User');
      setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? { ...i, attachments: [...i.attachments, newAtt] } : i))
      );
      showToast('Attachment uploaded successfully.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to upload attachment', 'error');
    }
  };

  const deleteAttachment = async (issueId: string, attachmentId: string) => {
    try {
      await attachmentApi.deleteAttachment(issueId, attachmentId);
      setIssues((prev) =>
          prev.map((i) =>
              i.id === issueId ? { ...i, attachments: i.attachments.filter((a) => a.id !== attachmentId) } : i
          )
      );
      showToast('Attachment removed.', 'info');
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete attachment', 'error');
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const currentProjectIssues = currentProject
      ? issues.filter((i) => i.projectId === currentProject.id)
      : [];

  const filteredIssues = currentProjectIssues.filter((issue) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchKey = issue.key.toLowerCase().includes(q);
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchLabel = issue.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchKey && !matchTitle && !matchDesc && !matchLabel) return false;
    }

    if (filters.types.length > 0 && !filters.types.includes(issue.type)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(issue.priority)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) return false;

    if (filters.assigneeId === 'UNASSIGNED') {
      if (issue.assigneeId) return false;
    } else if (filters.assigneeId !== 'ALL') {
      if (issue.assigneeId !== filters.assigneeId) return false;
    }

    if (filters.quickFilter === 'MY_ISSUES') {
      if (issue.assigneeId !== currentUser?.id) return false;
    } else if (filters.quickFilter === 'HIGH_PRIORITY_BUGS') {
      if (issue.type !== 'BUG' || (issue.priority !== 'HIGH' && issue.priority !== 'HIGHEST')) {
        return false;
      }
    } else if (filters.quickFilter === 'RECENT') {
      const twoDaysAgo = Date.now() - 48 * 3600 * 1000;
      if (new Date(issue.updatedAt).getTime() < twoDaysAgo) return false;
    }

    return true;
  });

  return (
      <AppContext.Provider
          value={{
            currentUser,
            isAuthenticated: !!currentUser,
            login,
            register,
            logout,
            users,
            projects,
            currentProject,
            setCurrentProjectKey: handleSelectProjectKey,
            createProject,
            deleteProject,
            updateProjectMembers,
            issues,
            currentProjectIssues,
            filteredIssues,
            createIssue,
            updateIssue,
            deleteIssue,
            moveIssueStatus,
            addComment,
            deleteComment,
            addAttachment,
            deleteAttachment,
            filters,
            setFilters,
            resetFilters,
            selectedIssueId,
            setSelectedIssueId,
            isCreateIssueOpen,
            setIsCreateIssueOpen,
            isProjectSettingsOpen,
            setIsProjectSettingsOpen,
            isNewProjectOpen,
            setIsNewProjectOpen,
            canEditIssue,
            canDeleteIssue,
            canDeleteProject,
            canManageProject,
            showToast,
            isLoading,
          }}
      >
        {children}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};