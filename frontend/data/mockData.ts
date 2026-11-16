import { User, Project, Issue } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Sarah Connor',
    email: 'sarah.connor@enterprise.io',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    title: 'Director of Engineering',
    department: 'Platform Architecture',
  },
  {
    id: 'usr-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@enterprise.io',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Engineering Sprint Lead',
    department: 'Cloud Core Services',
  },
  {
    id: 'usr-3',
    name: 'Maya Chen',
    email: 'maya.chen@enterprise.io',
    role: 'DEVELOPER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Senior Java / Spring Engineer',
    department: 'Backend API Team',
  },
  {
    id: 'usr-4',
    name: 'Leo Kim',
    email: 'leo.kim@enterprise.io',
    role: 'DEVELOPER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    title: 'Full Stack Developer',
    department: 'Web Applications Team',
  },
  {
    id: 'usr-5',
    name: 'Devon Vance',
    email: 'devon.vance@enterprise.io',
    role: 'DEVELOPER',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    title: 'DevOps & Reliability Engineer',
    department: 'Infrastructure',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Cloud Core Platform',
    key: 'CORE',
    description: 'Central microservices hub handling distributed ticketing, event publishing, and high-throughput transaction routing.',
    leadId: 'usr-2',
    issueCountSequence: 108,
    createdAt: '2026-01-15T09:00:00Z',
    members: [
      { userId: 'usr-1', role: 'ADMIN', joinedAt: '2026-01-15T09:00:00Z' },
      { userId: 'usr-2', role: 'MANAGER', joinedAt: '2026-01-15T09:00:00Z' },
      { userId: 'usr-3', role: 'DEVELOPER', joinedAt: '2026-01-16T10:00:00Z' },
      { userId: 'usr-4', role: 'DEVELOPER', joinedAt: '2026-01-16T10:00:00Z' },
      { userId: 'usr-5', role: 'DEVELOPER', joinedAt: '2026-01-20T11:00:00Z' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Security & Auth Gateway',
    key: 'AUTH',
    description: 'Spring Security 6 with stateless JWT access/refresh token rotation and RBAC policy enforcement.',
    leadId: 'usr-1',
    issueCountSequence: 45,
    createdAt: '2026-02-01T08:30:00Z',
    members: [
      { userId: 'usr-1', role: 'ADMIN', joinedAt: '2026-02-01T08:30:00Z' },
      { userId: 'usr-3', role: 'DEVELOPER', joinedAt: '2026-02-02T09:15:00Z' },
    ],
  },
  {
    id: 'proj-3',
    name: 'Realtime WebSocket Sync',
    key: 'SYNC',
    description: 'STOMP / SockJS broker for live multi-user ticket state updates and instant notifications.',
    leadId: 'usr-2',
    issueCountSequence: 22,
    createdAt: '2026-02-10T14:00:00Z',
    members: [
      { userId: 'usr-2', role: 'MANAGER', joinedAt: '2026-02-10T14:00:00Z' },
      { userId: 'usr-4', role: 'DEVELOPER', joinedAt: '2026-02-11T10:00:00Z' },
    ],
  },
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'iss-1',
    key: 'CORE-101',
    projectId: 'proj-1',
    title: 'Fix HikariCP connection pool starvation during bulk issue export',
    description: `### Problem Summary
Under heavy concurrent load (>250 req/sec), the database connection pool drops below safe limits and throws \`SQLTransientConnectionException\`: Connection is not available, request timed out after 30000ms.

### Root Cause
Hibernate session was kept open during CSV streaming serialization instead of using a read-only paginated cursor with \`@Transactional(readOnly = true)\`.

### Steps to Reproduce
1. Trigger \`GET /api/v1/issues/export?format=csv&includeComments=true\` with 50 concurrent threads.
2. Observe Hikari active connections climb to max (20/20) and thread lock.

### Proposed Fix
- Configure connection pool max to 50 with \`leakDetectionThreshold = 2000ms\`
- Implement Spring Batch or reactive cursor stream for bulk serialization.`,
    type: 'BUG',
    priority: 'HIGHEST',
    status: 'IN_PROGRESS',
    assigneeId: 'usr-3',
    reporterId: 'usr-2',
    storyPoints: 5,
    sprint: 'Sprint 14',
    labels: ['backend', 'spring-boot', 'performance', 'database'],
    components: ['Persistence Layer', 'HikariCP'],
    dueDate: '2026-11-14',
    createdAt: '2026-11-05T10:15:00Z',
    updatedAt: '2026-11-09T14:22:00Z',
    attachments: [
      {
        id: 'att-1',
        name: 'hikari-connection-leak.log',
        size: '142 KB',
        url: '#',
        uploadedAt: '2026-11-06T11:00:00Z',
        uploadedBy: 'Maya Chen',
        type: 'log',
      },
    ],
    comments: [
      {
        id: 'comm-1',
        authorId: 'usr-3',
        content: 'Investigated the thread dump. The issue is in `IssueReportService.java:142`. Switching to JDBC streaming query solves the retention leak.',
        createdAt: '2026-11-07T16:30:00Z',
      },
      {
        id: 'comm-2',
        authorId: 'usr-2',
        content: 'Great catch Maya! Make sure to also add an automated integration test with Testcontainers PostgreSQL.',
        createdAt: '2026-11-08T09:12:00Z',
      },
    ],
    activityLogs: [
      {
        id: 'act-1',
        userId: 'usr-2',
        action: 'Created issue CORE-101',
        timestamp: '2026-11-05T10:15:00Z',
      },
      {
        id: 'act-2',
        userId: 'usr-2',
        action: 'Assigned to Maya Chen',
        timestamp: '2026-11-05T10:20:00Z',
      },
      {
        id: 'act-3',
        userId: 'usr-3',
        action: 'Changed status from TO_DO to IN_PROGRESS',
        timestamp: '2026-11-06T09:00:00Z',
      },
    ],
  },
  {
    id: 'iss-2',
    key: 'CORE-102',
    projectId: 'proj-1',
    title: 'Implement drag-and-drop Kanban card transitions with optimistic updates',
    description: `Users need to drag cards across Backlog, To Do, In Progress, In Review, and Done columns smoothly without page reload.

#### Acceptance Criteria
- Cards should animate smoothly with drop indicators
- Status updates should be dispatched optimistically with rollback on failure
- WIP limits should display warning badges when exceeded
- Keyboard shortcuts (\`[\` and \`]\`) should allow quick column shifts`,
    type: 'STORY',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    assigneeId: 'usr-4',
    reporterId: 'usr-2',
    storyPoints: 8,
    sprint: 'Sprint 14',
    labels: ['frontend', 'kanban', 'ux'],
    components: ['Kanban Board', 'React UI'],
    dueDate: '2026-11-12',
    createdAt: '2026-11-04T08:00:00Z',
    updatedAt: '2026-11-10T11:45:00Z',
    attachments: [],
    comments: [
      {
        id: 'comm-3',
        authorId: 'usr-4',
        content: 'PR is up! Added clean drag handle and drop targets with visual indicator feedback.',
        createdAt: '2026-11-10T11:45:00Z',
      },
    ],
    activityLogs: [
      {
        id: 'act-4',
        userId: 'usr-2',
        action: 'Created issue CORE-102',
        timestamp: '2026-11-04T08:00:00Z',
      },
      {
        id: 'act-5',
        userId: 'usr-4',
        action: 'Moved status to IN_REVIEW',
        timestamp: '2026-11-10T11:40:00Z',
      },
    ],
  },
  {
    id: 'iss-3',
    key: 'CORE-103',
    projectId: 'proj-1',
    title: 'Add multipart screenshot file upload with thumbnail preview',
    description: `Support drag-and-drop file upload for issue reproduction screenshots and crash log attachments.

Requirements:
- Support PNG, JPG, WebP, and plain text / log files up to 10MB
- Display file size, upload timestamp, and uploader user
- Lightbox modal preview for image files
- Delete action with confirmation dialog for authorized roles`,
    type: 'TASK',
    priority: 'MEDIUM',
    status: 'TO_DO',
    assigneeId: 'usr-4',
    reporterId: 'usr-1',
    storyPoints: 3,
    sprint: 'Sprint 14',
    labels: ['attachments', 'ui', 'storage'],
    components: ['File Uploader'],
    dueDate: '2026-11-16',
    createdAt: '2026-11-06T14:10:00Z',
    updatedAt: '2026-11-06T14:10:00Z',
    attachments: [],
    comments: [],
    activityLogs: [
      {
        id: 'act-6',
        userId: 'usr-1',
        action: 'Created issue CORE-103',
        timestamp: '2026-11-06T14:10:00Z',
      },
    ],
  },
  {
    id: 'iss-4',
    key: 'CORE-104',
    projectId: 'proj-1',
    title: 'JWT access token refresh endpoint fails when header contains lowercase bearer prefix',
    description: `### Bug Details
Some HTTP client proxies and mobile libraries send \`authorization: bearer <token>\` (lowercase). The JWT filter in \`JwtAuthenticationFilter.java\` checked \`startsWith("Bearer ")\` with strict case sensitivity, resulting in 401 Unauthorized for valid tokens.

### Fix
Use \`header.regionMatches(true, 0, "Bearer ", 0, 7)\` or case-insensitive prefix parsing.`,
    type: 'BUG',
    priority: 'HIGH',
    status: 'DONE',
    assigneeId: 'usr-3',
    reporterId: 'usr-3',
    storyPoints: 2,
    sprint: 'Sprint 14',
    labels: ['security', 'jwt', 'auth'],
    components: ['Security Gateway'],
    dueDate: '2026-11-08',
    createdAt: '2026-11-02T11:20:00Z',
    updatedAt: '2026-11-07T18:00:00Z',
    attachments: [],
    comments: [
      {
        id: 'comm-4',
        authorId: 'usr-3',
        content: 'Fixed and verified with unit test suite covering Bearer, bearer, and BEARER headers.',
        createdAt: '2026-11-07T17:50:00Z',
      },
    ],
    activityLogs: [
      {
        id: 'act-7',
        userId: 'usr-3',
        action: 'Created issue CORE-104',
        timestamp: '2026-11-02T11:20:00Z',
      },
      {
        id: 'act-8',
        userId: 'usr-3',
        action: 'Transitioned status to DONE',
        timestamp: '2026-11-07T18:00:00Z',
      },
    ],
  },
  {
    id: 'iss-5',
    key: 'CORE-105',
    projectId: 'proj-1',
    title: 'Migrate microservice build pipelines to Java 21 LTS and virtual threads',
    description: `Upgrade project runtime from Java 17 to Java 21 LTS. Enable Project Loom virtual threads via \`spring.threads.virtual.enabled=true\` for high-concurrency request handling without reactive complexity.`,
    type: 'EPIC',
    priority: 'LOW',
    status: 'BACKLOG',
    assigneeId: 'usr-5',
    reporterId: 'usr-1',
    storyPoints: 13,
    sprint: 'Sprint 15',
    labels: ['architecture', 'java21', 'upgrade'],
    components: ['Build & CI/CD'],
    dueDate: '2026-12-01',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
    attachments: [],
    comments: [],
    activityLogs: [
      {
        id: 'act-9',
        userId: 'usr-1',
        action: 'Created epic CORE-105',
        timestamp: '2026-11-01T09:00:00Z',
      },
    ],
  },
  {
    id: 'iss-6',
    key: 'CORE-106',
    projectId: 'proj-1',
    title: 'Design OpenAPI 3.0 / Swagger documentation with interactive try-it-out',
    description: `Generate OpenAPI 3.0 schemas for all issue tracking endpoints with schema definitions for UserDto, IssueDto, CommentRequest, and AuthTokenResponse. Include JWT Bearer authentication scheme in Swagger UI.`,
    type: 'TASK',
    priority: 'MEDIUM',
    status: 'DONE',
    assigneeId: 'usr-3',
    reporterId: 'usr-2',
    storyPoints: 3,
    sprint: 'Sprint 14',
    labels: ['swagger', 'openapi', 'docs'],
    components: ['API Docs'],
    dueDate: '2026-11-09',
    createdAt: '2026-11-03T13:45:00Z',
    updatedAt: '2026-11-09T16:00:00Z',
    attachments: [],
    comments: [],
    activityLogs: [],
  },
  {
    id: 'iss-7',
    key: 'CORE-107',
    projectId: 'proj-1',
    title: 'Enforce Role-Based Access Control (RBAC) on issue deletion and project mutation',
    description: `Ensure that only ADMIN or MANAGER roles can delete tickets and modify team rosters. DEVELOPER role users should see disabled or hidden deletion triggers with descriptive permission hints.`,
    type: 'STORY',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assigneeId: 'usr-3',
    reporterId: 'usr-1',
    storyPoints: 5,
    sprint: 'Sprint 14',
    labels: ['security', 'rbac', 'permissions'],
    components: ['Security Gateway'],
    dueDate: '2026-11-15',
    createdAt: '2026-11-08T10:00:00Z',
    updatedAt: '2026-11-09T11:20:00Z',
    attachments: [],
    comments: [],
    activityLogs: [],
  },
];
