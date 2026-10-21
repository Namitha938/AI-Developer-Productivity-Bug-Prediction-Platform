import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  GitPullRequest,
  Sparkles,
  Shield,
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fixTab, setFixTab] = useState<'Optimization' | 'Refactoring' | 'Tests'>('Optimization');
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: 'Jordan Rivera',
      avatar: 'JR',
      color: 'bg-indigo-600',
      time: '18 min ago',
      text: 'Please add the timeout regression test before we ship v2.8.',
    },
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
`const result = await gateway.capture({
  amount, currency: order.currency,
  reference: order.id,
  idempotencyKey: \`payment:\${order.id}\`
});`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: 'Maya Chen',
        avatar: 'MC',
        color: 'bg-blue-600',
        time: 'Just now',
        text: replyText.trim(),
      },
    ]);
    setReplyText('');
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* 1. Header with Breadcrumb, Title & PR Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span>Code analysis</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Duplicate payment capture
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5">
            <span className="font-mono text-slate-500">
              TP-284 / payments-service / src/services/payment.ts : 11–14
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              High severity
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              In progress
            </span>
            <span className="text-slate-400">
              CWE-841 · First detected Oct 21, 09:42
            </span>
            <Link
              to="/editor"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
            >
              ← Back to findings
            </Link>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <span>+ Create fix PR</span>
          </button>
        </div>
      </div>

      {/* 2. Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Why this fails, Suggested fix, Refactoring (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Why this is likely to fail */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Why this is likely to fail
              </h3>
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                AI explanation
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The capture request has no idempotency key. If the gateway succeeds but the response times out, the retry repeats the charge before the order is marked as paid.
            </p>

            {/* Sequence Flow Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Capture succeeds
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Response times out
                </span>
              </div>
              <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-center">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Retry charges again
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Evidence: external side effect before persistence · retry path in utils/retry.ts
            </div>
          </div>

          {/* Suggested Fix */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Suggested fix
              </h3>
              <span className="text-[11px] text-slate-400">
                Review before applying
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800 pb-2">
              {(['Optimization', 'Refactoring', 'Tests'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFixTab(tab)}
                  className={`pb-1 transition-colors cursor-pointer ${
                    fixTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code Diff Box */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] text-slate-300 p-4 font-mono text-xs overflow-x-auto space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-800">
                <span>suggested / payment.ts • TypeScript</span>
                <span>UTF-8</span>
              </div>

              <div className="space-y-1 pt-1 leading-relaxed">
                <div className="text-slate-400">
                  <span className="text-slate-600 select-none mr-4">11</span>
                  <span>const result = await gateway.capture({'{'}</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-600 select-none mr-4">12</span>
                  <span>  amount, currency: order.currency,</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-600 select-none mr-4">13</span>
                  <span>  reference: order.id,</span>
                </div>
                <div className="bg-emerald-950/40 text-emerald-400 py-0.5 px-1 rounded -mx-1">
                  <span className="text-emerald-600 select-none mr-4">14</span>
                  <span>  idempotencyKey: `payment:${'{'}order.id{'}'}`</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-600 select-none mr-4">15</span>
                  <span>{'}'});</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Proposed change · not applied <strong className="text-emerald-600 font-semibold">+1 line</strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use a stable key per order. The gateway can safely return the original result on repeated requests, avoiding duplicate captures.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy suggestion'}</span>
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View patch</span>
              </button>
            </div>
          </div>

          {/* Refactoring & Verification */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Refactoring & verification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Extract captureWithIdempotency() into the payment adapter. Add a retry ceiling of 3 with exponential backoff and move amount validation to the service boundary.
            </p>
            <div className="pt-1">
              <a
                href="#test"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Suggested test: gateway succeeds, response times out, retry returns one charge →
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction details, Discussion, AI note (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prediction Details Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Prediction details
                </h3>
                <span className="text-[11px] text-slate-400">Risk score</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-rose-600">86</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
                <span className="block text-[10px] text-rose-500 font-semibold">High risk</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Model confidence</span>
                <span className="font-semibold">94%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Impact</span>
                <span className="font-semibold">Financial integrity</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Time / space</span>
                <span className="font-semibold font-mono">O(1) / O(1)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Model</span>
                <span className="font-semibold">Trace engine v2.4</span>
              </div>
            </div>
          </div>

          {/* Ownership & Discussion */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Ownership & discussion
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  MC
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Maya Chen</div>
                  <div className="text-[10px] text-slate-400">Assigned by Jordan · Due Oct 23</div>
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-3 pt-2">
                {comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.author}</span>
                      <span className="text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{c.text}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleAddComment} className="pt-2">
                <input
                  type="text"
                  placeholder="Reply or @mention a teammate…"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </form>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="#pay-42"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View linked task PAY-42 →
                </a>
              </div>
            </div>
          </div>

          {/* AI note */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1">
            <span className="font-semibold text-blue-900 dark:text-blue-300 block">
              AI is a second pair of eyes.
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              This prediction is not a confirmed runtime failure. Validate the suggested change with tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
