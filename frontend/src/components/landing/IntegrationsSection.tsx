import React from 'react';
import {
  Github,
  Code2,
  GitBranch,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  Workflow,
  Terminal,
} from 'lucide-react';

export const IntegrationsSection: React.FC = () => {
  const integrations = [
    {
      name: 'GitHub',
      category: 'Code Hosting & CI',
      description: 'Automated PR review bot, status checks, and security advisories via GitHub Actions.',
      icon: Github,
      status: 'Native Integration',
    },
    {
      name: 'VS Code Extension',
      category: 'Developer Workstation',
      description: 'Real-time AST diagnostics and inline code risk highlighting directly inside editor tabs.',
      icon: Code2,
      status: 'Active Support',
    },
    {
      name: 'GitLab CI/CD',
      category: 'Version Control',
      description: 'Generates gl-code-quality-report.json and gates merge requests on high-risk files.',
      icon: GitBranch,
      status: 'Native Integration',
    },
    {
      name: 'JetBrains IDEs',
      category: 'Developer Workstation',
      description: 'IntelliJ, PyCharm, and WebStorm plugin for cognitive complexity inspection.',
      icon: Terminal,
      status: 'Active Support',
    },
    {
      name: 'Slack & Teams',
      category: 'Team Communications',
      description: 'Dispatches instant webhook alerts when high-risk files or zero-days are pushed to main.',
      icon: MessageSquare,
      status: 'Active Support',
    },
    {
      name: 'Jira Software',
      category: 'Project Management',
      description: 'Automatically creates prioritized bug tickets with reproduction steps and stack traces.',
      icon: Workflow,
      status: 'Native Integration',
    },
  ];

  return (
    <section id="integrations" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
            <Workflow className="w-3.5 h-3.5" />
            <span>Ecosystem Integrations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Seamlessly Fits Your Existing Toolchain
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            No proprietary lock-in. Connect BugPulse AI to your current repositories, code editors,
            and task boards with one-click OAuth authorization.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#fafafa] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 hover:border-indigo-400 dark:hover:border-indigo-600/70 transition-all duration-300 flex flex-col justify-between group cursor-default"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                      {item.category}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Webhooks & REST API</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

