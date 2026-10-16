import React from 'react';
import { ComplexityMetrics } from '../../types';
import { Activity, Clock, Layers, ShieldCheck, Cpu } from 'lucide-react';

interface ComplexityCardProps {
  complexity: ComplexityMetrics;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ complexity }) => {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Complexity & Efficiency
        </h4>
        <span className="text-xs font-mono text-muted-foreground">
          Maintainability Index: <strong className="text-foreground">{complexity.maintainabilityIndex}%</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-[11px] text-muted-foreground">Cyclomatic</p>
          <p className="text-lg font-bold font-mono mt-0.5 text-foreground">
            {complexity.cyclomaticComplexity}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {complexity.cyclomaticComplexity > 10 ? 'High branching' : 'Manageable'}
          </span>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-[11px] text-muted-foreground">Cognitive</p>
          <p className="text-lg font-bold font-mono mt-0.5 text-foreground">
            {complexity.cognitiveComplexity}
          </p>
          <span className="text-[10px] text-muted-foreground">Readability strain</span>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-[11px] text-muted-foreground">Halstead Volume</p>
          <p className="text-lg font-bold font-mono mt-0.5 text-foreground">
            {complexity.halsteadVolume}
          </p>
          <span className="text-[10px] text-muted-foreground">Operator density</span>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
          <p className="text-[11px] text-muted-foreground">Lines of Code</p>
          <p className="text-lg font-bold font-mono mt-0.5 text-foreground">
            {complexity.linesOfCode}
          </p>
          <span className="text-[10px] text-muted-foreground">Executable LOC</span>
        </div>
      </div>

      {/* Algorithmic Efficiency Badges */}
      <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Estimated Time Complexity:</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
            {complexity.timeComplexity}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-medium">Space Complexity:</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
            {complexity.spaceComplexity}
          </span>
        </div>
      </div>
    </div>
  );
};

