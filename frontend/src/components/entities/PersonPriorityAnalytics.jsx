import React from 'react';
import { Target, BarChart2, AlertCircle, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';

const LEVEL_COLORS = {
  'HIGH': 'bg-red-50 text-red-700 border-red-200',
  'MEDIUM': 'bg-amber-50 text-amber-700 border-amber-200',
  'LOW': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function PersonPriorityAnalytics({ priority = null, graphMetrics = {} }) {
  const hasPriority = Boolean(priority);
  const priorityScore = hasPriority ? Math.round((priority.priority_score || 0) * 100) : null;
  const priorityLevel = (priority?.priority_level || 'STANDARD').toUpperCase();
  const reasons = priority?.reasons || [];
  const supportingEvidence = priority?.supporting_evidence || [];

  const degreeCentrality = graphMetrics.degree_centrality != null ? (graphMetrics.degree_centrality).toFixed(3) : null;
  const betweennessCentrality = graphMetrics.betweenness_centrality != null ? (graphMetrics.betweenness_centrality).toFixed(3) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Investigation Priority & Graph Analytics</h2>
        </div>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Analytical Lead Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Score Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investigation Priority</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">
                  {priorityScore != null ? priorityScore : 'Unscored'}
                </span>
                {priorityScore != null && (
                  <span className="text-xs text-slate-400">/ 100</span>
                )}
              </div>
            </div>

            {hasPriority && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${LEVEL_COLORS[priorityLevel] || 'bg-slate-100 text-slate-700'}`}>
                {priorityLevel} PRIORITY
              </span>
            )}
          </div>

          {/* Progress bar */}
          {priorityScore != null && (
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  priorityLevel === 'HIGH' ? 'bg-red-500' : priorityLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(priorityScore, 100)}%` }}
              />
            </div>
          )}

          {/* Analytical Justifications */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-700">Analytical Reasons:</div>
            {reasons.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-600">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Standard baseline priority. Multi-case cross-referencing required.
              </p>
            )}
          </div>

          {supportingEvidence.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Supporting Evidence</div>
              <p className="text-xs text-slate-600 italic">
                {supportingEvidence.join(' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Graph Centrality Metrics Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-indigo-600" />
              Graph Topological Centrality
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Algorithmically computed structural importance across the intelligence network graph.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Degree Centrality</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {degreeCentrality ?? '0.000'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Direct connection volume</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Betweenness</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {betweennessCentrality ?? '0.000'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bridge / intermediary role</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700">Safety Notice</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Analytical priority and centrality metrics reflect synthetic data patterns. Requires human verification before any operational decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
