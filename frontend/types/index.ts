export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department: string;
}

export type IssueType = 'BUG' | 'STORY' | 'TASK' | 'EPIC';

export type IssuePriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export type IssueStatus = 'BACKLOG' | 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  type: 'image' | 'log' | 'doc';
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Issue {
  id: string;
  key: string; // e.g. "CORE-101"
  projectId: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assigneeId?: string;
  reporterId: string;
  storyPoints?: number;
  sprint?: string;
  labels: string[];
  components: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  attachments: Attachment[];
  activityLogs: ActivityLog[];
}

export interface ProjectMember {
  userId: string;
  role: UserRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "CORE", "AUTH"
  description: string;
  leadId: string;
  members: ProjectMember[];
  issueCountSequence: number;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  types: IssueType[];
  priorities: IssuePriority[];
  statuses: IssueStatus[];
  assigneeId: string | 'ALL' | 'UNASSIGNED';
  quickFilter: 'ALL' | 'MY_ISSUES' | 'HIGH_PRIORITY_BUGS' | 'RECENT';
}

export type ActiveTab = 'BOARD' | 'LIST' | 'DASHBOARD';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  department?: string;
  title?: string;
}
