import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Cpu, CheckCircle2, Loader2, ShieldCheck, GitFork } from 'lucide-react';

export const ScanProgressBar: React.FC = () => {
  const { isScanningRepo, scanProgress, scanCurrentStep } = useProjectStore();

  if (!isScanningRepo && scanProgress === 0) return null;

  return (
    <div className="bg-card text-card-foreground border border-primary/30 rounded-xl p-4 shadow-md space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isScanningRepo ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          )}
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {isScanningRepo ? 'Deep Repository Scan in Progress' : 'Repository Analysis Completed'}
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono">{scanCurrentStep}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-primary">{scanProgress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 via-primary to-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${scanProgress}%` }}
        />
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-[10px] font-mono">
        <div className={`p-1.5 rounded text-center ${scanProgress >= 25 ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'}`}>
          1. AST Parser
        </div>
        <div className={`p-1.5 rounded text-center ${scanProgress >= 50 ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'}`}>
          2. Call Graph
        </div>
        <div className={`p-1.5 rounded text-center ${scanProgress >= 75 ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground'}`}>
          3. ML Predictor
        </div>
        <div className={`p-1.5 rounded text-center ${scanProgress === 100 ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-muted-foreground'}`}>
          4. Security Heuristics
        </div>
      </div>
    </div>
  );
};

