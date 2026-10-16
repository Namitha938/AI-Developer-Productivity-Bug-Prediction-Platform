export type UserRole = 'developer' | 'tech_lead' | 'admin';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  stackoverflow?: string;
}

export interface ConnectedAccount {
  provider: 'google' | 'github';
  connected: boolean;
  email?: string;
  connectedAt?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  title: string;
  company?: string;
  location?: string;
  bio?: string;
  githubUsername?: string;
  socialLinks?: SocialLinks;
  connectedAccounts?: ConnectedAccount[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  backupCodesRemaining?: number;
  createdAt: string;
  lastActive: string;
  token?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface CodeSmell {
  id: string;
  type: string;
  severity: Severity;
  lineStart: number;
  lineEnd: number;
  message: string;
  recommendation: string;
  impact: string;
}

export interface DuplicateBlock {
  id: string;
  fileA: string;
  linesA: [number, number];
  fileB: string;
  linesB: [number, number];
  similarityScore: number;
  duplicatedSnippet: string;
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  halsteadVolume: number;
  linesOfCode: number;
  maintainabilityIndex: number; // 0-100
  timeComplexity: string;       // e.g. "O(N^2)"
  spaceComplexity: string;      // e.g. "O(N)"
}

export interface RiskyLine {
  lineNumber: number;
  severity: Severity;
  bugType: string;
  confidence: number;
  description: string;
  suggestedFixSnippet?: string;
}

export interface AnalysisResult {
  id: string;
  filename: string;
  language: string;
  timestamp: string;
  overallRiskScore: number; // 0 - 100
  riskCategory: 'Critical Risk' | 'High Risk' | 'Moderate Risk' | 'Low Risk' | 'Clean';
  executionTimeMs: number;
  sourceCode: string;
  summary: string;
  riskyLines: RiskyLine[];
  complexity: ComplexityMetrics;
  codeSmells: CodeSmell[];
  duplicateBlocks: DuplicateBlock[];
  aiExplanation: {
    rootCause: string;
    consequences: string[];
    cweRef?: string;
    securityThreatLevel: 'None' | 'Moderate' | 'Severe';
  };
  refactorSuggestion: {
    summary: string;
    beforeCode: string;
    afterCode: string;
    performanceGain: string;
  };
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  assignee: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  project: string;
  fileLocation: string;
  lineRange: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  codeSnippet?: string;
  commentsCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  defaultBranch: string;
  healthScore: number; // 0 - 100
  openIssuesCount: number;
  resolvedIssuesCount: number;
  testCoveragePercent: number;
  lastScannedAt: string;
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  }[];
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    name: string;
    avatarUrl: string;
  };
  dueDate: string;
  tags: string[];
  bugIssueId?: string;
}

export interface GitHubRepo {
  id: string;
  name: string;
  owner: string;
  stars: number;
  forks: number;
  openPRs: number;
  lastCommitMessage: string;
  lastCommitHash: string;
  lastCommitDate: string;
  branch: string;
  isConnected: boolean;
  scanStatus: 'idle' | 'scanning' | 'passed' | 'warning' | 'failed';
  lastScanRiskScore?: number;
}

export interface PullRequestItem {
  id: string;
  prNumber: number;
  title: string;
  author: string;
  avatarUrl: string;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  riskScore: number;
  aiVerdict: 'Approved' | 'Changes Required' | 'High Risk Detected';
  createdAt: string;
}

export interface CommitItem {
  hash: string;
  shortHash: string;
  author: string;
  avatarUrl: string;
  message: string;
  timestamp: string;
  riskScore: number;
  filesChanged: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical_bug' | 'scan_complete' | 'issue_assigned' | 'pr_reviewed' | 'system';
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}

export interface ModelPerformanceMetric {
  date: string;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
}

export interface ProductivityMetric {
  week: string;
  linesAnalyzed: number;
  bugsPrevented: number;
  prReviewTimeHours: number;
  devVelocityScore: number;
}

