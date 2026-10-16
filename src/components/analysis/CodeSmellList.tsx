import React from 'react';
import { CodeSmell } from '../../types';
import { SeverityBadge } from '../common/Badges';
import { Flame, ArrowRight, Lightbulb } from 'lucide-react';

interface CodeSmellListProps {
  smells: CodeSmell[];
  onLineClick?: (line: number) => void;
}

export const CodeSmellList: React.FC<CodeSmellListProps> = ({ smells, onLineClick }) => {
  if (smells.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-border">
        No code smells identified. Code follows architectural best practices!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {smells.map((smell) => (
        <div
          key={smell.id}
          className="bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/40 space-y-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-muted text-foreground">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <h5 className="text-sm font-semibold text-foreground">{smell.type}</h5>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLineClick && onLineClick(smell.lineStart)}
                className="text-xs font-mono px-2 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                title="Jump to code line in editor"
              >
                Lines {smell.lineStart}-{smell.lineEnd}
              </button>
              <SeverityBadge severity={smell.severity} />
            </div>
          </div>

          <p className="text-xs text-foreground/90 font-medium">{smell.message}</p>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
            <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Fix: {smell.recommendation}</span>
            </div>
            <p className="text-muted-foreground text-[11px] pl-5">
              <strong>Impact:</strong> {smell.impact}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

