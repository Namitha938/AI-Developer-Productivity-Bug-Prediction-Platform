import React from 'react';
import { Code, BookOpen } from 'lucide-react';

interface LanguageSelectProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onSnippetSelect: (snippetKey: string) => void;
  selectedSnippetKey: string;
}

const LANGUAGES = [
  { id: 'python', label: 'Python (asyncpg / SQL)' },
  { id: 'typescript', label: 'TypeScript / React' },
  { id: 'javascript', label: 'JavaScript (Node.js)' },
  { id: 'go', label: 'Go (Goroutines & Chans)' },
  { id: 'rust', label: 'Rust (Memory Safe)' },
];

const SNIPPET_PRESETS = [
  { key: 'python_memory_leak', label: '🐍 Python: SQL Injection & Pool Leak', lang: 'python' },
  { key: 'ts_event_leak', label: '⚡ TS: Event Listener Memory Growth', lang: 'typescript' },
  { key: 'go_channel_deadlock', label: '🐹 Go: Unbuffered Channel Deadlock', lang: 'go' },
  { key: 'clean_rust_snippet', label: '🦀 Rust: Clean Token Bucket (No Bugs)', lang: 'rust' },
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  language,
  onLanguageChange,
  onSnippetSelect,
  selectedSnippetKey,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Language Selector */}
      <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-2.5 py-1">
        <Code className="w-3.5 h-3.5 text-primary" />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-card text-foreground">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Snippet Template presets */}
      <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-2.5 py-1">
        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
        <select
          value={selectedSnippetKey}
          onChange={(e) => onSnippetSelect(e.target.value)}
          className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
        >
          <option value="" disabled className="bg-card text-foreground">
            Select Test Bug Scenario...
          </option>
          {SNIPPET_PRESETS.map((item) => (
            <option key={item.key} value={item.key} className="bg-card text-foreground">
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

