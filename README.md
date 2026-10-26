# AI Developer Productivity & Bug Prediction Platform

An intelligent, full-stack, web-based platform that helps software engineers and tech leads analyze source code quality, predict potential defects using machine learning, detect code smells and vulnerabilities, manage development sprints, and monitor developer velocity.

---

## 📋 Overview & Core Architecture

The platform combines **static code analysis (AST)**, **supervised machine learning**, and **generative AI models** with an interactive developer workspace:

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React 18)                  │
│       Monaco Editor • Kanban • Recharts • Zustand      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼────────────────────────────┐
│                  Backend (FastAPI)                     │
│         Firebase Admin Auth • Cloud Firestore          │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼──────────────┐ ┌───────────▼─────────────┐
│   ML Prediction Service    │ │   AI Analysis Engine    │
│  Random Forest / CodeT5    │ │ Google Gemini • Groq    │
│   AST Feature Extraction   │ │      OpenAI API         │
└────────────────────────────┘ └─────────────────────────┘
```

- **Frontend Client**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Lucide Icons, Recharts, Zustand, and TanStack Query.
- **Backend API**: FastAPI (Python 3.11), Firebase Admin SDK for auth, Google Cloud Firestore for persistent storage.
- **ML Microservice (`bugpulse-ml-service`)**: Dedicated microservice serving trained bug-risk prediction models (`bug_risk_model.joblib`), static metrics extraction, and risk categorization.
- **Multi-Provider AI Analysis**: Fallback orchestration across Google Gemini (`gemini-2.5-flash`), Groq (`llama-3.3-70b-versatile`), and OpenAI.

---

## ✨ 20 Key Features Implemented

1. **User Registration & Secure Authentication**
   - Firebase Authentication with email/password and Google OAuth.
   - Protected routes, role-based access control (`developer`, `tech_lead`, `admin`), session verification, and token exchange.

2. **Personalized Developer Dashboard**
   - High-level KPI summary cards (open issues, average risk score, velocity score, LOC analyzed).
   - Commit vs. intercepted bug activity visualizer, critical risk watchlist, and recent audit activity feed.

3. **Code Editor with Syntax Highlighting**
   - Full Monaco Editor integration supporting line numbers, minimap, automatic indentation, and inline error highlights.
   - Gutter glyph annotations marking vulnerable code sections.

4. **Multi-Language Support**
   - Language-aware analysis supporting **Python, JavaScript, TypeScript, Go, Java, Rust, C++, C, C#, PHP, Ruby, and SQL**.

5. **AI-Powered Bug Prediction & Risk Scoring**
   - Machine learning inference calculating overall risk scores (0–100) and risk categorizations (*Clean, Low Risk, Moderate Risk, High Risk, Critical Risk*).

6. **Automatic Detection of Common Coding Errors**
   - Precise line-level detection of null pointer/undefined dereferences, off-by-one errors, resource leaks, and unhandled exceptions.

7. **Code Quality & Maintainability Analysis**
   - Evaluation of Halstead Volume, executable Lines of Code (LOC), and Maintainability Index ratings.

8. **Code Complexity Analysis (Time & Space Efficiency)**
   - Calculation of Cyclomatic Complexity and Cognitive Complexity.
   - Algorithmic Big-O time complexity (e.g., $O(n)$, $O(n^2)$) and space complexity estimations.

9. **AI-Generated Explanations of Potential Bugs**
   - Root-cause breakdown, runtime consequences, common weaknesses (CWE references), and security threat levels.

10. **Suggestions for Code Optimization & Refactoring**
    - Side-by-side Before/After diff viewer with one-click **"Apply Refactor Fix"** directly into the code editor.

11. **Code Smell & Duplicate Code Detection**
    - Categorized smell detection (long methods, high coupling, unused code) and cross-file duplicate code block detection with similarity scoring.

12. **GitHub Repository Integration**
    - Link personal GitHub repositories with Personal Access Tokens (PAT).
    - Trigger automated repository scans and vulnerability audits.

13. **Pull Request & Commit Activity Tracking**
    - Pull request risk scoring with AI verdict badges (*Approved, Changes Requested, High Risk*).
    - Commit history feed showing change volumes and associated risk tags.

14. **Developer Task & Project Management**
    - Multi-project workspace management.
    - Drag-and-drop interactive Kanban task board across *Backlog, To Do, In Progress, In Review,* and *Completed*.

15. **Productivity Analytics & Activity Reports**
    - Recharts trend visualizations covering 7-day, 30-day, and 90-day activity intervals.
    - Developer velocity, bug prevention rates, and issue resolution metrics.

16. **Bug History with Severity & Status Tracking**
    - Centralized issue tracker with filtering by severity (*Critical, High, Medium, Low*) and status (*Open, In Progress, Resolved*).
    - Dedicated issue detail pages with source code contexts and threaded comments.

17. **Team Collaboration & Issue Assignment**
    - Team creation, member invitations, and direct issue reassignment to team members.

18. **Notifications for High-Risk Code & Unresolved Issues**
    - Global notification bell dropdown with unread counters and dedicated notification management page.

19. **Admin Dashboard for Managing Users & Analysis Records**
    - Comprehensive admin overview displaying user accounts, active status toggles, role elevations, and live service health diagnostics.

20. **Code Quality Trends & Model Performance Reports**
    - Real-time precision, recall, and F1-score tracking.
    - Exportable code quality reports in PDF and JSON formats.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Recharts, Lucide React, Zustand, TanStack Query |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, HTTPX |
| **Authentication & Database** | Firebase Authentication, Google Cloud Firestore, Firebase Admin SDK |
| **Machine Learning** | Scikit-learn, Joblib, AST feature extractors, CodeT5 fine-tuning pipeline |
| **Generative AI** | Google GenAI SDK (Gemini 2.5 Flash), Groq Cloud API, OpenAI API |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.x and **npm** >= 9.x
- **Python** 3.11.x
- A Google Firebase / Google Cloud project with **Firestore** enabled

---

### 2. Environment Configuration

#### Frontend (`frontend/.env`)
Create `frontend/.env` with your Firebase web app credentials:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (`backend/.env`)
Create `backend/.env`:
```env
APP_NAME=BugPulse AI
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
FIREBASE_CREDENTIALS_PATH=secrets/ServiceAccountKey.json
BUGPULSE_ML_SERVICE_URL=http://127.0.0.1:8001
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```
Place your Firebase Admin service account key at:
```
backend/secrets/ServiceAccountKey.json
```

---

### 3. Running the Services

#### A. Start the ML Service (Terminal 1)
```bash
cd bugpulse-ml-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```
*Health check:* `http://127.0.0.1:8001/health`

#### B. Start the FastAPI Backend (Terminal 2)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
*API docs:* `http://localhost:8000/docs`

#### C. Start the Frontend (Terminal 3)
```bash
cd frontend
npm install
npm run dev
```
*Web application:* `http://localhost:5173`

---

## 📂 Project Directory Structure

```
├── frontend/                        # React 18 + Vite + TypeScript Client
│   ├── src/
│   │   ├── api/                     # Axios client & typed API service endpoints
│   │   ├── components/              # UI components (editor, kanban, analysis, auth)
│   │   ├── pages/                   # Application route pages
│   │   ├── stores/                  # Zustand state stores (auth, analysis, issues, projects)
│   │   └── types/                   # TypeScript schemas and data models
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/endpoints/        # Route endpoints (auth, analysis, github, issues, etc.)
│   │   ├── core/                    # App config, database connectors, Firebase admin
│   │   ├── services/                # Multi-LLM analysis engine & fix generator
│   │   └── main.py                  # FastAPI bootstrap & CORS middleware
│   ├── secrets/                     # Firebase service account keys (gitignored)
│   └── requirements.txt
│
├── bugpulse-ml-service/             # ML Inference Microservice
│   ├── app/                         # FastAPI app & feature extractors
│   ├── artifacts/                   # Pre-trained models (bug_risk_model.joblib)
│   └── requirements.txt
│
└── README.md                        # Documentation
```

---

## 🔒 Security Best Practices
- **Secret Keys**: All API keys, environment files, and `ServiceAccountKey.json` files are excluded from version control via `.gitignore`.
- **Token Verification**: Every backend request is authenticated and decoded via the Firebase Admin SDK.
- **Untrusted Code Isolation**: User-submitted code snippets are treated as untrusted data and strictly evaluated without remote code execution vulnerabilities.

---

## 📄 License
This project is licensed under the MIT License.
