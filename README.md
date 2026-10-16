# BugPulse AI — Developer Productivity & Bug Prediction Platform

An intelligent web-based platform that helps software developers analyze code quality, predict potential bugs, identify inefficient coding patterns, and monitor engineering velocity.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Monaco Editor**, **Recharts**, **TanStack Query**, and **Zustand**.

---

## ⚡ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark/light themes & custom risk tokens
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) with inline risk line highlights and gutter glyph annotations
- **Charts & Visualizations**: [Recharts](https://recharts.org/) (Model accuracy trends, Developer velocity, Risk distributions)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching & Caching**: [TanStack Query v5](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/) with request interceptors & automatic 401 token refresh queue
- **Icons**: [Lucide React](https://lucide.dev/)
- **Delight Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) on AI refactor apply

---

## 🚀 Key Features Implemented

### 1. Developer Landing Page & Interactive Playground
- **Hero & Value Proposition**: Live platform highlights, neural engine status, and one-click demo launch.
- **Interactive Code Playground**: Live side-by-side comparison of vulnerable vs. AI-refactored code with real-time heuristic scoring.
- **Core Capability Grid**: Highlighting AST parsing, predictive bug scoring, Monaco integration, code smells, GitHub sync, and Kanban boards.
- **How It Works**: 3-step walkthrough from code ingestion to 1-click refactoring.
- **Accuracy Benchmarks**: F1-score (94.8%), inference latency (< 350ms), and PR review turnaround acceleration.
- **Responsive Navigation**: Dark/Light mode toggle, quick navigation links, and auth triggers.

### 2. Authentication & Security
- **Registration**: Form validation (password length, match verification, terms acceptance).
- **Login**: Email/password authentication with quick-fill demo presets (Developer, Tech Lead, Admin).
- **GitHub OAuth**: Single-click GitHub login simulation.
- **Route Guards**: `ProtectedRoute` checks active session and redirects unauthenticated users to `/login`.
- **Token Refresh**: Axios request and response interceptors automatically retry requests with token rotation.

### 2. Developer Dashboard
- **Metric Cards**: Open bug issues count, average repository risk score, recent analyses, developer velocity.
- **Activity Visualizer**: 7-day Recharts area chart comparing commits vs intercepted bug count.
- **High-Risk Watchlist**: Quick triage list of critical severity vulnerabilities.
- **Active Repositories**: Live repo health score, test coverage, and open issue counts.
- **Analysis Audit Feed**: Table of recent AST and ML model inspections.

### 3. Monaco Code Editor & Inline Risk Annotations
- Integrated Monaco Editor supporting **Python, TypeScript, JavaScript, Go, and Rust**.
- **Sample Bug Scenarios**:
  - Python: SQL Injection (CWE-89) & Asyncpg Connection Pool Exhaustion.
  - TypeScript: Unbound Event Listener & Memory Growth in WebSockets.
  - Go: Unbuffered Channel Goroutine Deadlock.
  - Rust: Clean, zero-bug Token Bucket algorithm.
- **Inline Risk Highlights**: Red/amber line backgrounds, gutter glyph markers, and hover documentation.
- Dynamic **Analyze** trigger with simulated AST parsing & deep learning inference latency.

### 4. Analysis Results Panel
- **Risk Score Gauge**: Smooth circular SVG gauge with risk categories (Critical, High, Moderate, Clean).
- **Complexity & Efficiency**: Cyclomatic, Cognitive, Halstead volume, and Big-O Time & Space estimations.
- **Code Smells**: Categorized list with line jump triggers, impact, and remediation steps.
- **Duplicate Code**: Cross-file duplicate block detector with percentage similarity score.
- **AI Explanation**: Root cause breakdown, runtime failure consequences, and CWE security references.
- **Refactoring Diff**: Side-by-side Before/After diff viewer with one-click **"Apply Refactor Fix"** action.

### 5. Issues & Bug Tracker
- Filterable bug directory by **Severity** (Critical, High, Medium, Low), **Status** (Open, In Progress, Resolved), and **Assignee**.
- **Issue Detail Page**: Deep contextual view with file coordinates, code snippet, status/assignee controls, and threaded discussion comments.

### 6. Projects & Kanban Task Board
- Multi-project selector (`core-payment-gateway`, `auth-identity-service`, `realtime-notification-engine`).
- **Member Management**: Role assignment (Admin, Lead, Contributor) and invite modal.
- **Interactive Kanban Board**: 5 workflow columns (*Backlog, To Do, In Progress, In Review, Completed*) with task movement and new task creation modal.

### 7. GitHub Integration UI
- **Synced Repositories**: Star counts, forks, default branch, and last commit status.
- **Pull Requests**: AI review verdicts (*Approved, Changes Required, High Risk Detected*) and diff line counts.
- **Commits Stream**: Risk score badges per commit.
- **Multi-Stage Scanner**: Real-time progress bar visualizer (*AST Parser -> Call Graph -> ML Predictor -> Security Heuristics*).
- **Connect Modal**: Link external GitHub repositories.

### 8. Analytics & Reports
- **ML Model Metrics**: Precision, Recall, and F1-score trends over time.
- **Productivity & Velocity**: Lines of code analyzed and bugs prevented per sprint.
- **PR Acceleration**: Turnaround hours from PR creation to merge.
- **Exporting**: Simulated PDF Quality Audit and JSON dataset downloads.

### 9. Real-Time Notifications
- Bell icon in the navbar with unread badge counter.
- Header quick dropdown with direct issue links and mark-as-read triggers.
- **Simulated WebSocket Stream**: Background event emitter feeding live CI/CD and critical bug alerts.
- **Full Notifications Page**: Categorized tabs and management actions.

### 10. Admin Governance Panel
- **User Management**: Role elevation/demotion, token reset triggers, and status badges.
- **Analysis Audit Records**: Timestamp, filename, LOC, and risk score logs with CSV export.
- **Model Tuning**: Active model latency, token throughput, and hyperparameter controls (Temperature, Confidence Threshold).

### 11. Shared Design System & UX
- Persistent **Dark Mode** & **Light Mode** toggle.
- Responsive collapsible sidebar with project switcher and engine health pill.
- Polished empty states, skeletons, and modal dialogs.
- Reusable `SeverityBadge`, `StatusBadge`, and `RiskPill` components.

---

## 💻 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```
Generates production-optimized assets in `dist/`.

---

## 📂 Project Structure

```
src/
├── api/
│   ├── client.ts             # Axios instance with refresh interceptors
│   └── mockData.ts           # Realistic datasets: repos, bugs, code snippets, metrics
├── components/
│   ├── analysis/             # RiskGauge, ComplexityCard, CodeSmellList, DuplicateCodeList, AiExplanation, RefactorDiff
│   ├── common/               # Badges, StatCard, EmptyState, Modal, LoadingSkeleton
│   ├── editor/               # Monaco CodeEditor, LanguageSelect
│   ├── github/               # ScanProgressBar, ConnectRepoModal
│   ├── kanban/               # KanbanBoard with sprint columns
│   ├── layout/               # Navbar, Sidebar, AppLayout
│   └── notifications/        # NotificationDropdown
├── pages/
│   ├── admin/AdminPanelPage.tsx
│   ├── analytics/AnalyticsReportsPage.tsx
│   ├── auth/LoginPage.tsx & RegisterPage.tsx & ProtectedRoute.tsx
│   ├── dashboard/DeveloperDashboard.tsx
│   ├── editor/EditorAnalysisPage.tsx
│   ├── github/GitHubIntegrationPage.tsx
│   ├── issues/IssuesListPage.tsx & IssueDetailPage.tsx
│   ├── notifications/NotificationsPage.tsx
│   ├── projects/ProjectsPage.tsx & TaskBoardPage.tsx
│   └── NotFoundPage.tsx
├── stores/                   # Zustand stores (auth, theme, analysis, issue, project, notification)
├── styles/globals.css        # Tailwind base and Monaco theme decorations
├── types/index.ts            # Data models and TypeScript definitions
├── App.tsx                   # Routes and TanStack Query provider
└── main.tsx                  # Application bootstrap
```

