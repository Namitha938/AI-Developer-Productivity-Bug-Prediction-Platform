# 📁 BugPulse AI — Full-Stack Project Folder Structure

This document outlines the directory and file architecture for both the **Frontend** (`frontend/`) and **Backend** (`backend/`) of the BugPulse AI platform.

---

## 🏗️ High-Level Architecture

```
AI Developer Productivity & Bug Prediction Platform/
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── public/               # Static Assets, SVGs & Visual Graphics
│   ├── src/                  # Application Source Code
│   │   ├── api/              # Axios HTTP Client & Offline Mock API Layer
│   │   ├── components/       # Modular UI Component Library
│   │   ├── pages/            # Route Page Views (Landing, Auth, Dashboard, IDE, etc.)
│   │   ├── stores/           # Zustand Global State Management
│   │   ├── styles/           # Tailwind CSS & Global Design Tokens
│   │   ├── types/            # TypeScript Interfaces & Domain Models
│   │   ├── utils/            # Utility Functions & Formatters
│   │   ├── App.tsx           # Top-Level Router & Providers
│   │   └── main.tsx          # React DOM Application Bootstrap
│   ├── .env                  # Local Environment Variables (VITE_USE_MOCK=true)
│   ├── .env.example          # Frontend Environment Template
│   ├── package.json          # Frontend Dependencies & Build Scripts
│   ├── tsconfig.json         # TypeScript Compiler Configuration
│   ├── tailwind.config.js    # Tailwind Theme, Grids, and Color Tokens
│   └── vite.config.ts        # Vite Build & Bundler Settings
│
├── backend/                  # Python FastAPI Backend Architecture
│   ├── app/
│   │   ├── api/              # API Route Handlers & Endpoints
│   │   ├── core/             # Configuration, Security, DB, WebSocket
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── schemas/          # Pydantic Validation Schemas
│   │   ├── services/         # AST Parsing & ML Bug Prediction Engines
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── tests/                # Pytest Test Suites
│   ├── .env.example          # Backend Environment Configuration Template
│   └── requirements.txt      # Python Package Dependencies
│
├── package.json              # Monorepo Workspace Runner Scripts (npm run dev/build)
├── PROJECT_STRUCTURE.md      # Full Architecture & Directory Reference Guide
└── README.md                 # Project Overview & Setup Instructions
```

---

## 🌐 1. Frontend Structure (`frontend/`)

```
frontend/
├── public/                           # Static Assets & Illustrated Graphics
│   ├── landing-hero.svg
│   ├── login-panel.svg
│   └── favicon.svg
│
├── src/

├── api/
│   ├── client.ts                     # Axios client with request/response interceptors & token rotation
│   ├── mockData.ts                   # Seed datasets (repositories, issues, metrics, code snippets)
│   └── mock/
│       └── mockAuthApi.ts            # Standalone Mock API layer (20 endpoints for offline dev)
│
├── components/
│   ├── analysis/                     # Code Analysis & Metric Panels
│   │   ├── AiExplanation.tsx         # Natural language bug explanation & CWE references
│   │   ├── CodeSmellList.tsx         # Detected smells with severity & line navigation
│   │   ├── ComplexityCard.tsx        # Cyclomatic, Cognitive, Halstead, Big-O metrics
│   │   ├── DuplicateCodeList.tsx     # Cross-file code duplication detector
│   │   ├── RefactorDiff.tsx          # Side-by-side Before/After diff with 1-click apply
│   │   └── RiskGauge.tsx             # SVG Risk Gauge with color-coded severity
│   │
│   ├── auth/                         # Authentication & Security Components
│   │   ├── AuthLayout.tsx            # Split layout: Cybernetic Neural Shield + Form
│   │   ├── OAuthButtons.tsx          # Google & GitHub OAuth triggers
│   │   ├── OtpInput.tsx              # 6-digit TOTP input with auto-advance & paste
│   │   ├── PasswordInput.tsx         # Input with show/hide password toggle
│   │   ├── PasswordStrength.tsx      # Dynamic strength bar & 4-criteria validation
│   │   └── TwoFactorSetupDialog.tsx  # 3-step 2FA setup modal (QR code, verify, backup codes)
│   │
│   ├── common/                       # Shared Atomic UI Components
│   │   ├── EmptyState.tsx            # Clean empty state placeholders
│   │   ├── LoadingSkeleton.tsx       # Skeleton loaders for async data
│   │   ├── Modal.tsx                 # Accessible modal dialog wrapper
│   │   ├── RiskPill.tsx              # Low / Medium / High / Critical risk badges
│   │   ├── SeverityBadge.tsx         # Severity indicator tokens
│   │   ├── StatCard.tsx              # KPI metric cards with trends & icons
│   │   └── StatusBadge.tsx           # Status pills (Open, In Progress, Resolved)
│   │
│   ├── editor/                       # Monaco Code Editor Integration
│   │   ├── CodeEditor.tsx            # Monaco editor with inline risk highlights & gutter glyphs
│   │   └── LanguageSelect.tsx        # Multi-language selector (Python, TS, JS, Go, Rust)
│   │
│   ├── github/                       # GitHub Integration UI
│   │   ├── ConnectRepoModal.tsx      # Modal to link external repositories
│   │   └── ScanProgressBar.tsx       # 4-stage pipeline progress visualizer
│   │
│   ├── kanban/                       # Kanban Agile Task Management
│   │   ├── KanbanBoard.tsx           # Sprint workflow columns (Backlog -> Completed)
│   │   ├── KanbanCard.tsx            # Draggable task cards with risk badges
│   │   └── NewTaskModal.tsx          # Task creation dialog
│   │
│   ├── landing/                      # Landing Page Sections (Enterprise SaaS)
│   │   ├── ArchitectureSection.tsx   # Dual AST + GNN hybrid pipeline architecture
│   │   ├── BenchmarksSection.tsx     # ML model accuracy, latency, and throughput stats
│   │   ├── CapabilitiesSection.tsx   # 6 core platform capabilities grid
│   │   ├── HeroProductShowcase.tsx   # Realistic dashboard UI mockup in browser frame
│   │   ├── IntegrationsSection.tsx   # GitHub, GitLab, VS Code, Slack, Jira integrations
│   │   ├── LandingFooter.tsx         # CTA banner, site directory & compliance badges
│   │   ├── LandingHero.tsx           # Centered headline, value proposition & trust badges
│   │   ├── LandingNavbar.tsx         # Sticky header with links, dark mode toggle & Sign In
│   │   └── SandboxScanner.tsx        # Interactive vulnerable vs refactored code playground
│   │
│   ├── layout/                       # Application Shell Layout
│   │   ├── AppLayout.tsx             # Sidebar + Navbar + Content wrapper
│   │   ├── Navbar.tsx                # App header with dynamic user avatar dropdown
│   │   └── Sidebar.tsx               # Collapsible navigation sidebar & engine status
│   │
│   ├── notifications/                # Real-Time Notification Center
│   │   ├── NotificationDropdown.tsx  # Navbar alert bell dropdown with unread counters
│   │   └── NotificationItem.tsx      # Individual alert item with quick actions
│   │
│   └── profile/                      # User Profile & Account Settings
│       ├── AvatarUploader.tsx        # Photo upload, drag-and-drop, zoom & crop modal
│       ├── ConnectedAccounts.tsx     # Google and GitHub account linking management
│       ├── SessionsList.tsx          # Active device sessions & revocation
│       └── SocialLinksForm.tsx       # Social URLs with HTTPS validation
│
├── pages/
│   ├── admin/
│   │   └── AdminPanelPage.tsx        # User governance, audit logs & model tuning
│   ├── analytics/
│   │   └── AnalyticsReportsPage.tsx  # ML metrics, developer velocity & PDF/JSON exports
│   ├── auth/
│   │   ├── ForgotPasswordPage.tsx    # Password reset link request
│   │   ├── LoginPage.tsx             # Email + OAuth login with 2FA intercept challenge
│   │   ├── OAuthCallbackPage.tsx     # OAuth redirect handler
│   │   ├── ProtectedRoute.tsx        # Route guard checking authentication & redirect
│   │   ├── PublicOnlyRoute.tsx       # Route guard redirecting authenticated users to dashboard
│   │   ├── RegisterPage.tsx          # Registration with email verification cooldown
│   │   ├── ResetPasswordPage.tsx     # New password configuration via token
│   │   └── VerifyEmailPage.tsx       # Email verification landing page
│   ├── dashboard/
│   │   └── DeveloperDashboard.tsx    # Main developer dashboard with charts & triage
│   ├── editor/
│   │   └── EditorAnalysisPage.tsx    # Full-screen code IDE with live ML analysis
│   ├── github/
│   │   └── GitHubIntegrationPage.tsx # Synced repos, PR reviews & multi-stage scanner
│   ├── issues/
│   │   ├── IssueDetailPage.tsx       # Contextual issue view with code snippet & comments
│   │   └── IssuesListPage.tsx        # Filterable bug and code smell directory
│   ├── notifications/
│   │   └── NotificationsPage.tsx     # Categorized notification center
│   ├── profile/
│   │   └── ProfilePage.tsx           # Comprehensive profile & security settings
│   ├── projects/
│   │   ├── ProjectsPage.tsx          # Multi-project selector & team member management
│   │   └── TaskBoardPage.tsx         # Interactive Kanban sprint board
│   ├── LandingPage.tsx               # Public marketing landing page
│   └── NotFoundPage.tsx              # 404 error page
│
├── stores/                           # Zustand Global State Stores
│   ├── analysisStore.ts              # Monaco editor code, AST metrics & analysis state
│   ├── authStore.ts                  # Authentication session, user profile & 2FA state
│   ├── issueStore.ts                 # Issues directory & filter parameters
│   ├── notificationStore.ts          # Unread notifications & WebSocket stream
│   ├── projectStore.ts               # Active projects, tasks & Kanban state
│   └── themeStore.ts                 # Dark / Light theme toggle & persistence
│
├── styles/
│   └── globals.css                   # Tailwind directives & Monaco custom glyph themes
├── types/
│   └── index.ts                      # Strict TypeScript interfaces & data contracts
├── utils/
│   └── formatters.ts                 # Dates, numbers, and risk score formatters
├── App.tsx                           # Top-level React Router & TanStack Query configuration
├── main.tsx                          # Application DOM mount
└── vite-env.d.ts                     # Environment variable types
```

---

## ⚙️ 2. Backend Structure (`backend/`)

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── api.py                  # Consolidated v1 router aggregating all endpoints
│   │       └── endpoints/              # Modular REST endpoint routers
│   │           ├── __init__.py
│   │           ├── analysis.py         # POST /code/analyze & POST /code/refactor
│   │           ├── analytics.py        # GET /analytics/overview & /export/json
│   │           ├── auth.py             # POST /auth/login, /register, /2fa, /refresh, /logout
│   │           ├── github.py           # GET /github/repositories & POST /github/webhook
│   │           ├── issues.py           # GET /issues/ & POST /issues/
│   │           ├── notifications.py    # GET /notifications/ & POST /notifications/broadcast
│   │           ├── projects.py         # GET /projects/ & POST /projects/tasks/move
│   │           └── users.py            # GET/PUT /user/profile, 2FA setup, avatar, sessions
│   │
│   ├── core/                           # System Infrastructure & Core Utilities
│   │   ├── __init__.py
│   │   ├── config.py                   # Pydantic BaseSettings, JWT secrets, DB URLs
│   │   ├── database.py                 # Async SQLAlchemy engine & session factory
│   │   ├── security.py                 # Bcrypt hashing, JWT token creation, pyotp 2FA
│   │   └── websocket.py                # ConnectionManager for real-time WebSocket push
│   │
│   ├── models/                         # Database ORM Models (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── analysis.py                 # AnalysisRun, MetricScore, CodeSmellRecord
│   │   ├── issue.py                    # Issue, CodeSnippet, IssueComment
│   │   ├── project.py                  # Project, ProjectMember, Task, KanbanColumn
│   │   └── user.py                     # User, UserSession, ConnectedAccount
│   │
│   ├── schemas/                        # Request & Response Validation Models (Pydantic)
│   │   ├── __init__.py
│   │   ├── analysis.py                 # AnalyzeRequest, AnalyzeResponse, ComplexityMetrics
│   │   ├── auth.py                     # LoginRequest, RegisterRequest, TokenResponse
│   │   ├── issue.py                    # IssueCreate, IssueOut
│   │   ├── project.py                  # ProjectCreate, TaskCreate, TaskMoveRequest
│   │   └── user.py                     # UserProfileOut, UserProfileUpdate, SessionOut
│   │
│   ├── services/                       # Business Logic & Machine Learning Engines
│   │   ├── __init__.py
│   │   ├── ast_analyzer.py             # AST parsing & complexity (Cyclomatic, Cognitive, Halstead)
│   │   ├── bug_predictor.py            # GNN bug risk scoring engine & heuristic classifier
│   │   └── refactor_engine.py          # Automated AI patch generation & unified diff synthesis
│   │
│   ├── __init__.py
│   └── main.py                         # FastAPI application entrypoint, CORS & WebSocket route
│
├── tests/                              # Automated Test Suite
│   ├── __init__.py
│   └── test_api.py                     # Unit & integration tests (Pytest)
│
├── .env.example                        # Backend environment configuration template
└── requirements.txt                    # Python dependencies (FastAPI, SQLAlchemy, Uvicorn, etc.)
```

