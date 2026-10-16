import React from 'react';
import { DuplicateBlock } from '../../types';
import { Copy, FileCode, CheckCircle2 } from 'lucide-react';

interface DuplicateCodeListProps {
  duplicates: DuplicateBlock[];
}

export const DuplicateCodeList: React.FC<DuplicateCodeListProps> = ({ duplicates }) => {
  if (duplicates.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border">
        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
        Zero duplicate code fragments detected across codebase repositories.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {duplicates.map((dup) => (
        <div
          key={dup.id}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-muted text-muted-foreground">
                <Copy className="w-3.5 h-3.5 text-indigo-500" />
              </span>
              <span className="text-xs font-semibold text-foreground">
                Cloned Fragment Detected
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {dup.similarityScore}% match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-muted/40 border border-border/60 flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-[11px] truncate">{dup.fileA}</span>
              <span className="ml-auto text-muted-foreground text-[10px]">
                Lines {dup.linesA[0]}-{dup.linesA[1]}
              </span>
            </div>
            <div className="p-2 rounded bg-muted/40 border border-border/60 flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-[11px] truncate">{dup.fileB}</span>
              <span className="ml-auto text-muted-foreground text-[10px]">
                Lines {dup.linesB[0]}-{dup.linesB[1]}
              </span>
            </div>
          </div>

          <div className="bg-muted/60 p-3 rounded-lg border border-border/60 overflow-x-auto">
            <pre className="text-[11px] font-mono text-muted-foreground">
              {dup.duplicatedSnippet}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

