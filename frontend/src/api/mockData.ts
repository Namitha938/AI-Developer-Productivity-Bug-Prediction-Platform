import {
  User,
  Project,
  Issue,
  TaskItem,
  GitHubRepo,
  PullRequestItem,
  CommitItem,
  NotificationItem,
  AnalysisResult,
  ModelPerformanceMetric,
  ProductivityMetric
} from '../types';

export const mockCurrentUser: User = {
  id: 'usr-dev-01',
  name: 'Maya Chen',
  username: 'mayachen',
  email: 'maya@acme.dev',
  avatarUrl: '',
  role: 'developer',
  title: 'Frontend developer',
  company: 'Acme Engineering',
  location: 'San Francisco, CA',
  bio: 'Frontend developer at Acme Engineering building reliable developer intelligence and code quality tools.',
  githubUsername: 'mayachen-dev',
  socialLinks: {
    github: 'https://github.com/mayachen-dev',
    linkedin: 'https://linkedin.com/in/mayachen-dev',
    twitter: 'https://twitter.com/mayachen_dev',
    website: 'https://mayachen.dev',
    stackoverflow: 'https://stackoverflow.com/users/1234567/mayachen',
  },
  connectedAccounts: [
    { provider: 'google', connected: true, email: 'maya.chen@acme.dev', connectedAt: '2025-10-12T09:10:00Z' },
    { provider: 'github', connected: true, email: 'mayachen-dev', connectedAt: '2025-10-12T09:10:00Z' },
  ],
  twoFactorEnabled: false,
  emailVerified: true,
  backupCodesRemaining: 8,
  createdAt: '2024-01-15T09:00:00Z',
  lastActive: 'Just now',
  token: 'mock-jwt-token-active-session-xyz789'
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'usr-lead-02',
    name: 'Elena Rostova',
    username: 'erostova',
    email: 'elena.rostova@codepulse.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'tech_lead',
    title: 'Staff Architect & Security Lead',
    company: 'BugPulse AI',
    location: 'Berlin, Germany',
    bio: 'Security researcher and distributed systems architect. Fan of formal methods.',
    githubUsername: 'erostova',
    socialLinks: {
      github: 'https://github.com/erostova',
      linkedin: 'https://linkedin.com/in/elena-rostova-tech',
    },
    connectedAccounts: [
      { provider: 'github', connected: true, email: 'elena@github.com' },
      { provider: 'google', connected: true, email: 'elena.rostova@codepulse.ai' },
    ],
    twoFactorEnabled: true,
    emailVerified: true,
    backupCodesRemaining: 10,
    createdAt: '2023-08-10T11:00:00Z',
    lastActive: '12m ago',
    token: 'mock-jwt-lead-123'
  },
  {
    id: 'usr-adm-03',
    name: 'Marcus Chen',
    username: 'mchen',
    email: 'marcus.chen@codepulse.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    title: 'Engineering Director / Admin',
    company: 'BugPulse AI',
    location: 'Austin, TX',
    bio: 'Directing engineering operations and model reliability infrastructure.',
    githubUsername: 'mchen-lead',
    socialLinks: {
      github: 'https://github.com/mchen-lead',
    },
    connectedAccounts: [
      { provider: 'github', connected: true, email: 'marcus@github.com' },
    ],
    twoFactorEnabled: false,
    emailVerified: true,
    createdAt: '2023-01-05T08:30:00Z',
    lastActive: '2h ago',
    token: 'mock-jwt-admin-456'
  },
  {
    id: 'usr-dev-04',
    name: 'Sarah Connor',
    username: 'sconnor',
    email: 'sarah.c@codepulse.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'developer',
    title: 'Backend Systems Engineer',
    twoFactorEnabled: false,
    emailVerified: true,
    githubUsername: 'sconnor',
    createdAt: '2024-03-20T14:15:00Z',
    lastActive: '34m ago',
  },
  {
    id: 'usr-dev-05',
    name: 'Devon Miles',
    username: 'devonmiles',
    email: 'devon.miles@codepulse.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'developer',
    title: 'Frontend Platform Engineer',
    twoFactorEnabled: false,
    emailVerified: true,
    githubUsername: 'devonmiles',
    createdAt: '2024-05-12T10:00:00Z',
    lastActive: '1d ago',
  }
];

export const sampleCodeSnippets: Record<string, { language: string; filename: string; code: string }> = {
  python_memory_leak: {
    language: 'python',
    filename: 'user_repository.py',
    code: `import asyncpg
import logging

active_pools = []

class UserRepository:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.connection_cache = {}

    async def get_user_by_id(self, user_id: str, search_filter: str = ""):
        # ⚠️ BUG: Unsafe string formatting leading to SQL injection risk
        query = f"SELECT * FROM users WHERE id = '{user_id}' AND status = '{search_filter}'"
        
        # ⚠️ BUG: Connection opened without context manager or close in finally
        conn = await asyncpg.connect(self.dsn)
        active_pools.append(conn) # ⚠️ Memory leak: global array retains references indefinitely
        
        try:
            row = await conn.fetchrow(query)
            if not row:
                return None
            return dict(row)
        except Exception as e:
            logging.error("Failed to query user: " + str(e))
            # Missing error handling or rollback
            return None
        # conn is never closed, leading to pool exhaustion

    def calculate_user_ranking(self, scores: list):
        # ⚠️ Code Smell: Inefficient O(N^2) sorting loop
        for i in range(len(scores)):
            for j in range(len(scores)):
                if scores[i] < scores[j]:
                    temp = scores[i]
                    scores[i] = scores[j]
                    scores[j] = temp
        return scores
`
  },
  ts_event_leak: {
    language: 'typescript',
    filename: 'WebSocketService.ts',
    code: `import { EventEmitter } from 'events';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private emitter = new EventEmitter();
  private cache = new Map<string, any>();

  public connect(endpoint: string): void {
    this.socket = new WebSocket(endpoint);

    // ⚠️ BUG: Event listeners attached on each connect call without removal
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // ⚠️ Unbounded cache accumulation causing browser memory exhaustion
      this.cache.set(data.id, data);
      this.emitter.emit('message', data);
    };
  }

  public subscribe(channel: string, callback: (data: any) => void): void {
    // ⚠️ Potential race condition: MaxListenersExceeded warning
    this.emitter.on(channel, callback);
  }

  private handleWindowResize(): void {
    console.log('Window resized', this.cache.size);
  }

  // ⚠️ Missing disconnect / cleanup method to unsubscribe events
}
`
  },
  go_channel_deadlock: {
    language: 'go',
    filename: 'worker_pool.go',
    code: `package main

import (
	"fmt"
	"sync"
)

// Worker processes jobs and sends to unbuffered channel
func ProcessBatch(items []int) []int {
	ch := make(chan int) // ⚠️ Bug: unbuffered channel blocks if reader not ready
	var wg sync.WaitGroup
	results := []int{}

	for _, item := range items {
		wg.Add(1)
		go func(val int) {
			defer wg.Done()
			// ⚠️ Goroutine leak: sending to unbuffered channel with no guaranteed receiver
			ch <- val * 2
		}(item)
	}

	// ⚠️ Deadlock risk: wg.Wait blocks before channel consumer starts
	wg.Wait()
	close(ch)

	for res := range ch {
		results = append(results, res)
	}
	return results
}

func main() {
	nums := []int{1, 2, 3, 4, 5}
	fmt.Println(ProcessBatch(nums))
}
`
  },
  clean_rust_snippet: {
    language: 'rust',
    filename: 'token_bucket.rs',
    code: `use std::time::{Duration, Instant};

pub struct TokenBucket {
    capacity: f64,
    tokens: f64,
    fill_rate_per_sec: f64,
    last_update: Instant,
}

impl TokenBucket {
    pub fn new(capacity: f64, fill_rate_per_sec: f64) -> Self {
        Self {
            capacity,
            tokens: capacity,
            fill_rate_per_sec,
            last_update: Instant::now(),
        }
    }

    pub fn try_acquire(&mut self, requested: f64) -> bool {
        self.refill();
        if self.tokens >= requested {
            self.tokens -= requested;
            true
        } else {
            false
        }
    }

    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_update).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.fill_rate_per_sec).min(self.capacity);
        self.last_update = now;
    }
}
`
  }
};

export const mockDefaultAnalysisResult: AnalysisResult = {
  id: 'anl-88209',
  filename: 'user_repository.py',
  language: 'python',
  timestamp: new Date().toISOString(),
  overallRiskScore: 84,
  riskCategory: 'High Risk',
  executionTimeMs: 412,
  sourceCode: sampleCodeSnippets.python_memory_leak.code,
  summary: 'Critical vulnerability detected: Unsafe SQL string interpolation allows arbitrary SQL injection. Global connection array retains active database socket references causing unbounded memory leaks.',
  riskyLines: [
    {
      lineNumber: 13,
      severity: 'critical',
      bugType: 'SQL Injection (CWE-89)',
      confidence: 0.98,
      description: 'Dynamic SQL query built via f-string without parameterized binding. Direct attacker control over query syntax.',
      suggestedFixSnippet: 'query = "SELECT * FROM users WHERE id = $1 AND status = $2"\nrow = await conn.fetchrow(query, user_id, search_filter)'
    },
    {
      lineNumber: 17,
      severity: 'high',
      bugType: 'Memory Leak & Socket Starvation',
      confidence: 0.92,
      description: 'Connection object appended to module-level `active_pools` list and never removed or closed in a finally block.',
      suggestedFixSnippet: 'async with asyncpg.create_pool(self.dsn) as pool:\n    async with pool.acquire() as conn:\n        ...'
    },
    {
      lineNumber: 29,
      severity: 'medium',
      bugType: 'Algorithmic Inefficiency (O(N^2))',
      confidence: 0.88,
      description: 'Quadratic bubble-style nested loop used for sorting. Significant CPU degradation on collections > 1,000 items.',
      suggestedFixSnippet: 'return sorted(scores)'
    }
  ],
  complexity: {
    cyclomaticComplexity: 14,
    cognitiveComplexity: 18,
    halsteadVolume: 428.5,
    linesOfCode: 38,
    maintainabilityIndex: 46.2,
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(N)'
  },
  codeSmells: [
    {
      id: 'smell-1',
      type: 'Resource Leak',
      severity: 'critical',
      lineStart: 16,
      lineEnd: 25,
      message: 'Unclosed asyncpg connection in error path',
      recommendation: 'Use asynchronous context manager `async with pool.acquire()` to guarantee release back to the pool.',
      impact: 'Will deplete connection pool under moderate traffic (HTTP 504 Gateway Timeout).'
    },
    {
      id: 'smell-2',
      type: 'Broad Exception Clause',
      severity: 'medium',
      lineStart: 22,
      lineEnd: 25,
      message: 'Catching generic `Exception` swallows system interrupts and obscures specific DB failures',
      recommendation: 'Catch `asyncpg.PostgresError` specifically to allow graceful degradation.',
      impact: 'Masks underlying infrastructure drops and complicates debugging in production.'
    },
    {
      id: 'smell-3',
      type: 'Global Mutable State',
      severity: 'high',
      lineStart: 4,
      lineEnd: 4,
      message: 'Module-level list `active_pools` mutated across concurrent coroutines',
      recommendation: 'Encapsulate connection pooling within class instance lifecycle managed by DI container.',
      impact: 'Memory footprint grows monotonically over time without garbage collection.'
    }
  ],
  duplicateBlocks: [
    {
      id: 'dup-1',
      fileA: 'user_repository.py',
      linesA: [29, 36],
      fileB: 'billing_service.py',
      linesB: [82, 89],
      similarityScore: 94.6,
      duplicatedSnippet: 'for i in range(len(scores)):\n    for j in range(len(scores)):\n        if scores[i] < scores[j]:\n            temp = scores[i]\n            scores[i] = scores[j]\n            scores[j] = temp'
    }
  ],
  aiExplanation: {
    rootCause: 'The function `get_user_by_id` formats an untrusted parameter `user_id` directly into the SQL string template without utilizing PostgreSQL parameter placeholders ($1, $2). Simultaneously, raw database connections are instantiated without a cleanup lifecycle.',
    consequences: [
      'Attacker can append `OR 1=1--` to bypass authentication and extract confidential records.',
      'Memory consumption increases by ~4MB per 100 requests due to orphaned connections held in `active_pools`.',
      'High likelihood of TCP connection socket exhaustion within 15 minutes of production deployment.'
    ],
    cweRef: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    securityThreatLevel: 'Severe'
  },
  refactorSuggestion: {
    summary: 'Refactor to parameterized queries using a managed pool, eliminate the global leak list, and replace quadratic sort with native Timsort.',
    beforeCode: `async def get_user_by_id(self, user_id: str, search_filter: str = ""):
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND status = '{search_filter}'"
    conn = await asyncpg.connect(self.dsn)
    active_pools.append(conn)
    try:
        row = await conn.fetchrow(query)
        return dict(row) if row else None
    except Exception as e:
        logging.error("Failed to query user: " + str(e))
        return None`,
    afterCode: `async def get_user_by_id(self, user_id: str, search_filter: str = ""):
    query = """
        SELECT id, username, email, status, created_at 
        FROM users 
        WHERE id = $1 AND ($2 = '' OR status = $2)
    """
    async with self.pool.acquire() as conn:
        try:
            row = await conn.fetchrow(query, user_id, search_filter)
            return dict(row) if row else None
        except asyncpg.PostgresError as err:
            logging.error(f"Database error executing query for user {user_id}: {err}")
            raise UserRepositoryException("Database access failure") from err`,
    performanceGain: '18x faster execution, 0 bytes leaked, 100% immune to SQL injection'
  }
};

export const mockProjects: Project[] = [
  {
    id: 'prj-01',
    name: 'core-payment-gateway',
    description: 'High-throughput microservice processing PCI-compliant card transactions and webhooks.',
    repoUrl: 'https://github.com/codepulse/core-payment-gateway',
    defaultBranch: 'main',
    healthScore: 78,
    openIssuesCount: 9,
    resolvedIssuesCount: 42,
    testCoveragePercent: 88.4,
    lastScannedAt: '15 mins ago',
    members: [
      { id: 'usr-dev-01', name: 'Alex Rivera', email: 'alex.rivera@codepulse.ai', role: 'Maintainer', avatarUrl: mockCurrentUser.avatarUrl },
      { id: 'usr-lead-02', name: 'Elena Rostova', email: 'elena.rostova@codepulse.ai', role: 'Architect', avatarUrl: mockUsers[1].avatarUrl },
      { id: 'usr-dev-04', name: 'Sarah Connor', email: 'sarah.c@codepulse.ai', role: 'Contributor', avatarUrl: mockUsers[3].avatarUrl }
    ]
  },
  {
    id: 'prj-02',
    name: 'auth-identity-service',
    description: 'OAuth 2.1 & OIDC token exchange, RBAC middleware, and biometric MFA verification.',
    repoUrl: 'https://github.com/codepulse/auth-identity-service',
    defaultBranch: 'master',
    healthScore: 92,
    openIssuesCount: 3,
    resolvedIssuesCount: 65,
    testCoveragePercent: 94.2,
    lastScannedAt: '2 hours ago',
    members: [
      { id: 'usr-lead-02', name: 'Elena Rostova', email: 'elena.rostova@codepulse.ai', role: 'Maintainer', avatarUrl: mockUsers[1].avatarUrl },
      { id: 'usr-adm-03', name: 'Marcus Chen', email: 'marcus.chen@codepulse.ai', role: 'Admin', avatarUrl: mockUsers[2].avatarUrl }
    ]
  },
  {
    id: 'prj-03',
    name: 'realtime-notification-engine',
    description: 'Distributed WebSocket & push notification cluster with Redis pub/sub backplane.',
    repoUrl: 'https://github.com/codepulse/realtime-notification-engine',
    defaultBranch: 'main',
    healthScore: 64,
    openIssuesCount: 14,
    resolvedIssuesCount: 28,
    testCoveragePercent: 72.1,
    lastScannedAt: 'Yesterday',
    members: [
      { id: 'usr-dev-01', name: 'Alex Rivera', email: 'alex.rivera@codepulse.ai', role: 'Contributor', avatarUrl: mockCurrentUser.avatarUrl },
      { id: 'usr-dev-05', name: 'Devon Miles', email: 'devon.miles@codepulse.ai', role: 'Maintainer', avatarUrl: mockUsers[4].avatarUrl }
    ]
  }
];

export const mockIssues: Issue[] = [
  {
    id: 'ISSUE-1042',
    title: 'Critical SQL Injection in User Query Handler',
    description: 'User input concatenation in database queries without validation or parameterized bindings in repository layer.',
    severity: 'critical',
    status: 'open',
    assignee: {
      id: 'usr-dev-01',
      name: 'Alex Rivera',
      avatarUrl: mockCurrentUser.avatarUrl
    },
    project: 'core-payment-gateway',
    fileLocation: 'src/repositories/user_repository.py',
    lineRange: 'L12-L18',
    riskScore: 95,
    createdAt: '2025-05-10T14:30:00Z',
    updatedAt: '2025-05-11T09:15:00Z',
    tags: ['Security', 'SQLi', 'P0', 'CWE-89'],
    codeSnippet: 'query = f"SELECT * FROM users WHERE id = \'{user_id}\' AND status = \'{search_filter}\'"',
    commentsCount: 4
  },
  {
    id: 'ISSUE-1043',
    title: 'Monotonic Memory Growth in WebSocket Client',
    description: 'Unbounded event listener registrations and global cache growth cause high memory consumption in browser tabs.',
    severity: 'high',
    status: 'in_progress',
    assignee: {
      id: 'usr-dev-05',
      name: 'Devon Miles',
      avatarUrl: mockUsers[4].avatarUrl
    },
    project: 'realtime-notification-engine',
    fileLocation: 'client/WebSocketService.ts',
    lineRange: 'L14-L24',
    riskScore: 78,
    createdAt: '2025-05-09T18:00:00Z',
    updatedAt: '2025-05-11T11:00:00Z',
    tags: ['Memory Leak', 'Performance', 'DOM'],
    codeSnippet: 'window.addEventListener("resize", () => { this.handleWindowResize(); });',
    commentsCount: 7
  },
  {
    id: 'ISSUE-1044',
    title: 'Deadlock in Worker Pool Channel Dispatcher',
    description: 'Unbuffered Go channels written before consumer loop initialization results in thread lockup under concurrent workloads.',
    severity: 'high',
    status: 'open',
    assignee: {
      id: 'usr-dev-04',
      name: 'Sarah Connor',
      avatarUrl: mockUsers[3].avatarUrl
    },
    project: 'core-payment-gateway',
    fileLocation: 'pkg/workers/batch_dispatcher.go',
    lineRange: 'L18-L29',
    riskScore: 82,
    createdAt: '2025-05-08T11:20:00Z',
    updatedAt: '2025-05-09T16:45:00Z',
    tags: ['Concurrency', 'Deadlock', 'Go'],
    codeSnippet: 'ch := make(chan int)\nwg.Wait()\nclose(ch)',
    commentsCount: 2
  },
  {
    id: 'ISSUE-1045',
    title: 'Quadratic Bubble Sort on Order Checkout Items',
    description: 'O(N^2) sorting algorithm used on user cart items during transaction calculation.',
    severity: 'medium',
    status: 'resolved',
    assignee: {
      id: 'usr-dev-01',
      name: 'Alex Rivera',
      avatarUrl: mockCurrentUser.avatarUrl
    },
    project: 'core-payment-gateway',
    fileLocation: 'src/services/checkout_service.py',
    lineRange: 'L88-L102',
    riskScore: 52,
    createdAt: '2025-05-04T08:10:00Z',
    updatedAt: '2025-05-07T14:00:00Z',
    tags: ['Complexity', 'Performance', 'Refactor'],
    codeSnippet: 'for i in range(len(items)):\n    for j in range(len(items)): ...',
    commentsCount: 3
  },
  {
    id: 'ISSUE-1046',
    title: 'Missing Rate Limiting on Password Reset Endpoint',
    description: 'Endpoints allow arbitrary attempts without IP-based throttle, susceptible to brute-force enumerations.',
    severity: 'critical',
    status: 'in_progress',
    assignee: {
      id: 'usr-lead-02',
      name: 'Elena Rostova',
      avatarUrl: mockUsers[1].avatarUrl
    },
    project: 'auth-identity-service',
    fileLocation: 'routes/auth_routes.ts',
    lineRange: 'L45-L60',
    riskScore: 91,
    createdAt: '2025-05-07T13:40:00Z',
    updatedAt: '2025-05-11T12:00:00Z',
    tags: ['Security', 'Auth', 'BruteForce'],
    codeSnippet: 'router.post("/auth/reset-password", handlePasswordReset);',
    commentsCount: 9
  },
  {
    id: 'ISSUE-1047',
    title: 'Hardcoded JWT Secret Fallback in Dev Configuration',
    description: 'Default fallback value "super_secret_jwt_key_123" allowed when environment variable is undefined.',
    severity: 'low',
    status: 'resolved',
    assignee: {
      id: 'usr-dev-01',
      name: 'Alex Rivera',
      avatarUrl: mockCurrentUser.avatarUrl
    },
    project: 'auth-identity-service',
    fileLocation: 'config/jwt.ts',
    lineRange: 'L8-L12',
    riskScore: 35,
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-05-03T16:20:00Z',
    tags: ['Configuration', 'Security'],
    codeSnippet: 'const SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_123";',
    commentsCount: 1
  }
];

export const mockTasks: TaskItem[] = [
  {
    id: 'TSK-201',
    title: 'Implement asyncpg connection pooling wrapper',
    description: 'Replace raw connections with managed pool and configure min/max connection thresholds.',
    status: 'todo',
    priority: 'urgent',
    assignee: { name: 'Alex Rivera', avatarUrl: mockCurrentUser.avatarUrl },
    dueDate: 'Tomorrow',
    tags: ['Backend', 'DB', 'P0'],
    bugIssueId: 'ISSUE-1042'
  },
  {
    id: 'TSK-202',
    title: 'Refactor WebSocket listener cleanup with useEffect',
    description: 'Add unmount cleanup functions to prevent window listener duplication in SPA view transitions.',
    status: 'in_progress',
    priority: 'high',
    assignee: { name: 'Devon Miles', avatarUrl: mockUsers[4].avatarUrl },
    dueDate: 'May 18',
    tags: ['Frontend', 'Memory'],
    bugIssueId: 'ISSUE-1043'
  },
  {
    id: 'TSK-203',
    title: 'Benchmark buffered vs unbuffered channels in Go pipeline',
    description: 'Measure p99 latency under 10k messages/sec with race detector enabled.',
    status: 'review',
    priority: 'medium',
    assignee: { name: 'Sarah Connor', avatarUrl: mockUsers[3].avatarUrl },
    dueDate: 'May 19',
    tags: ['Performance', 'Go'],
    bugIssueId: 'ISSUE-1044'
  },
  {
    id: 'TSK-204',
    title: 'Set up Redis Sliding Window Rate Limiter',
    description: 'Enforce 5 requests per 15 minutes per IP on sensitive authentication routes.',
    status: 'in_progress',
    priority: 'urgent',
    assignee: { name: 'Elena Rostova', avatarUrl: mockUsers[1].avatarUrl },
    dueDate: 'May 16',
    tags: ['Security', 'Redis'],
    bugIssueId: 'ISSUE-1046'
  },
  {
    id: 'TSK-205',
    title: 'Upgrade ESLint security ruleset to v8.50',
    description: 'Enable no-eval, no-implied-eval and sonarjs cognitive complexity checks.',
    status: 'done',
    priority: 'low',
    assignee: { name: 'Alex Rivera', avatarUrl: mockCurrentUser.avatarUrl },
    dueDate: 'May 10',
    tags: ['Tooling', 'CI/CD']
  },
  {
    id: 'TSK-206',
    title: 'Audit Docker container base images for CVEs',
    description: 'Scan alpine and distroless images with Trivy in GitHub Actions workflow.',
    status: 'backlog',
    priority: 'medium',
    assignee: { name: 'Elena Rostova', avatarUrl: mockUsers[1].avatarUrl },
    dueDate: 'May 25',
    tags: ['DevOps', 'Security']
  }
];

export const mockGitHubRepos: GitHubRepo[] = [
  {
    id: 'repo-1',
    name: 'codepulse/core-payment-gateway',
    owner: 'codepulse',
    stars: 342,
    forks: 48,
    openPRs: 5,
    lastCommitMessage: 'feat(webhook): add signature verification with HMAC-SHA256',
    lastCommitHash: 'd7a9f82',
    lastCommitDate: '2 hours ago',
    branch: 'main',
    isConnected: true,
    scanStatus: 'warning',
    lastScanRiskScore: 78
  },
  {
    id: 'repo-2',
    name: 'codepulse/auth-identity-service',
    owner: 'codepulse',
    stars: 189,
    forks: 22,
    openPRs: 2,
    lastCommitMessage: 'fix(oauth): prevent token replay attack on refresh endpoint',
    lastCommitHash: 'c4e3b11',
    lastCommitDate: 'Yesterday',
    branch: 'master',
    isConnected: true,
    scanStatus: 'passed',
    lastScanRiskScore: 24
  },
  {
    id: 'repo-3',
    name: 'codepulse/realtime-notification-engine',
    owner: 'codepulse',
    stars: 520,
    forks: 94,
    openPRs: 8,
    lastCommitMessage: 'refactor(socket): optimize heartbeat interval and backoff',
    lastCommitHash: '8b12f67',
    lastCommitDate: '3 days ago',
    branch: 'main',
    isConnected: true,
    scanStatus: 'warning',
    lastScanRiskScore: 64
  },
  {
    id: 'repo-4',
    name: 'codepulse/frontend-dashboard',
    owner: 'codepulse',
    stars: 87,
    forks: 12,
    openPRs: 1,
    lastCommitMessage: 'ui(charts): integrate Recharts bug velocity visualization',
    lastCommitHash: 'f1e4a90',
    lastCommitDate: '4 hours ago',
    branch: 'develop',
    isConnected: false,
    scanStatus: 'idle'
  }
];

export const mockPullRequests: PullRequestItem[] = [
  {
    id: 'pr-108',
    prNumber: 108,
    title: 'feat: add async database connection pool and retry strategy',
    author: 'arivera-dev',
    avatarUrl: mockCurrentUser.avatarUrl,
    baseBranch: 'main',
    headBranch: 'feature/db-pooling',
    additions: 342,
    deletions: 120,
    riskScore: 22,
    aiVerdict: 'Approved',
    createdAt: '3 hours ago'
  },
  {
    id: 'pr-107',
    prNumber: 107,
    title: 'fix(auth): update token expiration validation and refresh rotation',
    author: 'erostova',
    avatarUrl: mockUsers[1].avatarUrl,
    baseBranch: 'master',
    headBranch: 'security/token-rotation',
    additions: 89,
    deletions: 44,
    riskScore: 18,
    aiVerdict: 'Approved',
    createdAt: '1 day ago'
  },
  {
    id: 'pr-106',
    prNumber: 106,
    title: 'perf: batch processing with raw goroutine channels',
    author: 'sconnor',
    avatarUrl: mockUsers[3].avatarUrl,
    baseBranch: 'main',
    headBranch: 'fix/batch-throughput',
    additions: 215,
    deletions: 68,
    riskScore: 84,
    aiVerdict: 'High Risk Detected',
    createdAt: '2 days ago'
  }
];

export const mockCommits: CommitItem[] = [
  {
    hash: 'd7a9f82bc0e1189',
    shortHash: 'd7a9f82',
    author: 'Alex Rivera',
    avatarUrl: mockCurrentUser.avatarUrl,
    message: 'feat(webhook): add signature verification with HMAC-SHA256',
    timestamp: '2 hours ago',
    riskScore: 18,
    filesChanged: 3
  },
  {
    hash: 'a38fe4190cbb219',
    shortHash: 'a38fe41',
    author: 'Sarah Connor',
    avatarUrl: mockUsers[3].avatarUrl,
    message: 'fix(worker): handle unbuffered channel closure properly',
    timestamp: '6 hours ago',
    riskScore: 42,
    filesChanged: 2
  },
  {
    hash: '8b12f67990ef101',
    shortHash: '8b12f67',
    author: 'Devon Miles',
    avatarUrl: mockUsers[4].avatarUrl,
    message: 'refactor(socket): optimize heartbeat interval and backoff',
    timestamp: 'Yesterday',
    riskScore: 68,
    filesChanged: 7
  },
  {
    hash: 'c4e3b11099238af',
    shortHash: 'c4e3b11',
    author: 'Elena Rostova',
    avatarUrl: mockUsers[1].avatarUrl,
    message: 'fix(oauth): prevent token replay attack on refresh endpoint',
    timestamp: '2 days ago',
    riskScore: 12,
    filesChanged: 4
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Risk Alert (CWE-89)',
    message: 'AI Bug Predictor detected high likelihood of SQL Injection in user_repository.py (Risk Score: 95/100).',
    type: 'critical_bug',
    timestamp: '10m ago',
    read: false,
    linkUrl: '/editor'
  },
  {
    id: 'notif-2',
    title: 'Repo Scan Completed',
    message: 'Scheduled scan on codepulse/core-payment-gateway finished. 3 high risk sections identified.',
    type: 'scan_complete',
    timestamp: '1h ago',
    read: false,
    linkUrl: '/github'
  },
  {
    id: 'notif-3',
    title: 'Issue Assigned to You',
    message: 'Elena Rostova assigned ISSUE-1042 "Critical SQL Injection in User Query Handler" to you.',
    type: 'issue_assigned',
    timestamp: '3h ago',
    read: true,
    linkUrl: '/issues/ISSUE-1042'
  },
  {
    id: 'notif-4',
    title: 'AI Code Review Ready for PR #108',
    message: 'Automated review passed with 0 critical defects. Suggested 2 minor micro-optimizations.',
    type: 'pr_reviewed',
    timestamp: '5h ago',
    read: true,
    linkUrl: '/github'
  },
  {
    id: 'notif-5',
    title: 'Model Update Deployed',
    message: 'DeepCode-BugPredictor-v4 model weights updated. F1-Score improved from 92.4% to 94.8%.',
    type: 'system',
    timestamp: '1d ago',
    read: true,
    linkUrl: '/admin'
  }
];

export const mockModelPerformance: ModelPerformanceMetric[] = [
  { date: 'Nov 2024', precision: 88.2, recall: 86.4, f1Score: 87.3, falsePositiveRate: 8.4 },
  { date: 'Dec 2024', precision: 89.6, recall: 88.1, f1Score: 88.8, falsePositiveRate: 7.6 },
  { date: 'Jan 2025', precision: 91.4, recall: 89.7, f1Score: 90.5, falsePositiveRate: 6.2 },
  { date: 'Feb 2025', precision: 92.8, recall: 91.2, f1Score: 92.0, falsePositiveRate: 5.1 },
  { date: 'Mar 2025', precision: 94.1, recall: 93.0, f1Score: 93.5, falsePositiveRate: 4.3 },
  { date: 'Apr 2025', precision: 95.4, recall: 94.2, f1Score: 94.8, falsePositiveRate: 3.6 }
];

export const mockProductivityMetrics: ProductivityMetric[] = [
  { week: 'W12', linesAnalyzed: 14200, bugsPrevented: 18, prReviewTimeHours: 14.5, devVelocityScore: 82 },
  { week: 'W13', linesAnalyzed: 18500, bugsPrevented: 24, prReviewTimeHours: 12.2, devVelocityScore: 86 },
  { week: 'W14', linesAnalyzed: 22100, bugsPrevented: 31, prReviewTimeHours: 9.8, devVelocityScore: 91 },
  { week: 'W15', linesAnalyzed: 28400, bugsPrevented: 39, prReviewTimeHours: 7.4, devVelocityScore: 95 },
  { week: 'W16', linesAnalyzed: 32900, bugsPrevented: 45, prReviewTimeHours: 5.9, devVelocityScore: 98 }
];

export const mockWeeklyActivity = [
  { day: 'Mon', commits: 14, bugsFound: 4, scansRun: 8, linesChecked: 4200 },
  { day: 'Tue', commits: 22, bugsFound: 7, scansRun: 15, linesChecked: 8900 },
  { day: 'Wed', commits: 35, bugsFound: 11, scansRun: 24, linesChecked: 14200 },
  { day: 'Thu', commits: 28, bugsFound: 5, scansRun: 19, linesChecked: 11500 },
  { day: 'Fri', commits: 19, bugsFound: 3, scansRun: 12, linesChecked: 7400 },
  { day: 'Sat', commits: 6, bugsFound: 1, scansRun: 4, linesChecked: 2100 },
  { day: 'Sun', commits: 4, bugsFound: 0, scansRun: 2, linesChecked: 1400 }
];

export const mockAnalysisAuditRecords = [
  {
    id: 'rec-901',
    timestamp: '2025-05-11 14:22:10',
    developer: 'Alex Rivera',
    filename: 'user_repository.py',
    project: 'core-payment-gateway',
    riskScore: 84,
    loc: 38,
    executionMs: 412,
    status: 'High Risk'
  },
  {
    id: 'rec-902',
    timestamp: '2025-05-11 13:45:00',
    developer: 'Devon Miles',
    filename: 'WebSocketService.ts',
    project: 'realtime-notification-engine',
    riskScore: 78,
    loc: 54,
    executionMs: 388,
    status: 'High Risk'
  },
  {
    id: 'rec-903',
    timestamp: '2025-05-11 11:10:45',
    developer: 'Sarah Connor',
    filename: 'batch_dispatcher.go',
    project: 'core-payment-gateway',
    riskScore: 82,
    loc: 45,
    executionMs: 295,
    status: 'High Risk'
  },
  {
    id: 'rec-904',
    timestamp: '2025-05-10 16:30:12',
    developer: 'Elena Rostova',
    filename: 'token_bucket.rs',
    project: 'auth-identity-service',
    riskScore: 12,
    loc: 42,
    executionMs: 180,
    status: 'Clean'
  },
  {
    id: 'rec-905',
    timestamp: '2025-05-10 09:12:33',
    developer: 'Alex Rivera',
    filename: 'checkout_service.py',
    project: 'core-payment-gateway',
    riskScore: 52,
    loc: 112,
    executionMs: 520,
    status: 'Moderate Risk'
  }
];

