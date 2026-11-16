# TrackFlow — Enterprise Bug & Issue Tracker

TrackFlow is a full-featured, Jira-like issue tracking and agile workflow management system designed for engineering teams. It features interactive Kanban boards with drag-and-drop workflow progression, high-density issue lists, comprehensive sprint metrics, role-based access control (RBAC), and ticket collaboration.

---

## Key Features

- **Agile Kanban Board**: 5-stage workflow pipeline (`Backlog`, `To Do`, `In Progress`, `In Review`, `Done`) powered by `@dnd-kit` with touch and pointer support, WIP limits, and drop previews.
- **Role-Based Access Control (RBAC)**:
  - **ADMIN**: Complete project management, project deletion, team roster assignment, and ticket deletion.
  - **MANAGER**: Project creation, team member management, and ticket deletion.
  - **DEVELOPER**: Ticket creation, commenting, and editing restricted to assigned or reported issues.
- **Issue Lifecycle Management**: Full detail drawer with markdown descriptions, story points (Fibonacci), priority levels (`Highest` to `Lowest`), labels, and components.
- **Multipart Attachments**: Upload screenshots and error log files with live preview.
- **Discussion Thread & Audit History**: Commenting system with relative timestamps and chronological activity audit logs.
- **Real Authentication & Routing**: Login and Register pages with React Router (`/login`, `/register`, `/projects`, `/projects/:key/board`, `/projects/:key/list`, `/projects/:key/dashboard`) guarded by `ProtectedRoute`.
- **Decoupled API Layer**: Built on Axios with request interceptors attaching JWT Bearer authorization tokens.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: Lucide React

### Backend (`/backend`)
- **Runtime**: Java 17 LTS
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 + stateless JWT
- **Database**: PostgreSQL (Production) / H2 in-memory (Local dev)
- **ORM**: Hibernate 6 / Spring Data JPA
- **API Documentation**: Springdoc OpenAPI 3.0 (Swagger UI at `/swagger-ui.html`)

---

## Project Structure

```
├── /backend/                 # Spring Boot 3 Java 17 REST API
│   ├── src/main/java/        # Controllers, Services, Entities, DTOs, Security
│   ├── src/main/resources/   # application.yml and profiles (dev, prod)
│   ├── Dockerfile            # Multi-stage production container
│   └── pom.xml               # Maven dependencies and build configuration
├── /src/                     # React 19 Frontend
│   ├── api/                  # Axios client, authApi, projectApi, issueApi
│   ├── components/           # KanbanBoard, ListView, DetailModal, Navbar
│   ├── context/              # AppContext with state & RBAC policy guards
│   ├── pages/                # LoginPage, RegisterPage, ProjectsPage, ProjectViewPage
│   └── types/                # Domain TypeScript interfaces
├── .env.example              # Environment variables template
└── package.json              # Frontend dependencies and scripts
```

---

## Quick Start Guide

### 1. Running the Frontend

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run at `http://localhost:3000`.

### 2. Running the Backend

In a separate terminal:

```bash
cd backend

# Run with local H2 in-memory database
mvn spring-boot:run
```

The backend REST API will run at `http://localhost:8080/api/v1` and the Swagger UI will be accessible at `http://localhost:8080/swagger-ui.html`.

---

## Default Test Accounts

| Name | Role | Email | Password |
|---|---|---|---|
| **Sarah Connor** | ADMIN | `sarah.connor@enterprise.io` | `password123` |
| **Alex Rivera** | MANAGER | `alex.rivera@enterprise.io` | `password123` |
| **Maya Chen** | DEVELOPER | `maya.chen@enterprise.io` | `password123` |
| **Leo Kim** | DEVELOPER | `leo.kim@enterprise.io` | `password123` |

---

## Production Deployment (Render / Cloud Run / Docker)

### Backend Environment Variables

| Variable | Description | Example |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active profile | `prod` |
| `PORT` | Container HTTP port | `8080` (or dynamic port from cloud host) |
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://db.render.com:5432/trackflow` |
| `DB_USER` | PostgreSQL username | `trackflow_admin` |
| `DB_PASSWORD` | PostgreSQL password | `production_db_password` |
| `JWT_SECRET` | 256-bit signing key (>=32 bytes; fails startup if missing) | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `https://trackflow-app.onrender.com` |
| `UPLOAD_DIR` | File attachment storage path | `/var/data/uploads` |

> ⚠️ **Render Deployment Note on Ephemeral Disks**:  
> On standard Render web services, container disks are ephemeral. Uploaded screenshots and log files stored in `UPLOAD_DIR` will not persist across container restarts or deploys unless you attach a **Render Persistent Disk** mounted at `UPLOAD_DIR` (e.g. `/var/data/uploads`).

### Docker Build

```bash
cd backend
docker build -t trackflow-backend:latest .
```

---

## License

Apache-2.0 License.

