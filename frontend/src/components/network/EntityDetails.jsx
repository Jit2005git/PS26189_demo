/**
 * EntityDetails — displays details for a selected Cytoscape node or edge.
 * 
 * IMPORTANT DATA INTEGRITY:
 * - Only renders data actually returned by GET /api/cases/{case_id}/graph
 * - Does NOT calculate, infer, or invent any entity attributes
 * - Does NOT label any entity as guilty, criminal, or network member
 */
import { X, Info } from 'lucide-react';

function DetailRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-sm text-slate-800 break-words">{String(value)}</div>
    </div>
  );
}

function ConfidenceBadge({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : pct >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-slate-600 bg-slate-50 border-slate-200';
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${color}`}>
      {pct}% confidence
    </span>
  );
}

export default function EntityDetails({ selected, onClose }) {
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
        <Info size={32} className="mb-3 opacity-40" />
        <p className="text-sm">Click a node or edge to view details.</p>
        <p className="text-xs mt-2 text-slate-300">All information sourced from validated backend evidence.</p>
      </div>
    );
  }

  const { elementType, data } = selected;

  if (elementType === 'node') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Entity Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <DetailRow label="Entity ID" value={data.id} />
          <DetailRow label="Entity Type" value={data.type} />
          <DetailRow label="Label / Value" value={data.label !== data.id ? data.label : undefined} />
          <DetailRow label="Source" value={data.source} />
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-yellow-50">
          <p className="text-xs text-amber-700 font-medium">
            Analytical lead only. Requires human verification.
          </p>
        </div>
      </div>
    );
  }

  if (elementType === 'edge') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-sm">Potential Relationship</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <DetailRow label="Source Entity" value={data.source} />
          <DetailRow label="Target Entity" value={data.target} />
          <DetailRow label="Relationship Type" value={data.relationship_type} />
          <div className="py-2 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
            <ConfidenceBadge value={data.confidence} />
          </div>
          <DetailRow label="Case" value={data.case_id} />
          <DetailRow label="Detection Method" value={data.detection_method} />
          <div className="py-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Evidence</div>
            <div className="text-xs text-slate-700 bg-slate-50 rounded p-2 border border-slate-200 break-words leading-relaxed">
              {data.evidence || 'No evidence text available.'}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-yellow-50">
          <p className="text-xs text-amber-700 font-medium">
            Analytical lead only. Requires human verification.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
