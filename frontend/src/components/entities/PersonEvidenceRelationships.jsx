import React from 'react';
import { Link2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonEvidenceRelationships({ relationships = [], personId }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Evidence-Backed Relationships</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {relationships.length} Provenance Links
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Relationships verified via telecom, financial records, or graph pipeline.
        </p>
      </div>

      {relationships.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
          No structured evidence relationships indexed for this person.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Relationship Type</th>
                  <th className="py-2.5 px-3.5">Connected Lead / Entity</th>
                  <th className="py-2.5 px-3.5">Direction</th>
                  <th className="py-2.5 px-3.5">Confidence</th>
                  <th className="py-2.5 px-3.5">Evidence Provenance</th>
                  <th className="py-2.5 px-3.5">Case Context</th>
                  <th className="py-2.5 px-3.5">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {relationships.map((rel, idx) => {
                  const isPerson = rel.connected_entity_id && rel.connected_entity_id.startsWith('PERSON-');

                  return (
                    <tr key={rel.relationship_id || idx} className="hover:bg-slate-50/70">
                      {/* Type */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {rel.relationship_type}
                        </span>
                      </td>

                      {/* Connected Entity */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {isPerson ? (
                          <button
                            onClick={() => {
                              navigate(`/entities/${rel.connected_entity_id}`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 text-left flex items-center gap-1"
                          >
                            <span>{rel.connected_entity_name || rel.connected_entity_id}</span>
                            <ExternalLink size={10} className="text-slate-400" />
                          </button>
                        ) : (
                          <div className="font-semibold text-slate-900">
                            {rel.connected_entity_name || rel.connected_entity_id}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rel.connected_entity_id}
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {rel.direction === 'OUTGOING' ? (
                            <>
                              <span>Outgoing</span>
                              <ArrowRight size={10} className="text-slate-500" />
                            </>
                          ) : (
                            <>
                              <ArrowLeft size={10} className="text-slate-500" />
                              <span>Incoming</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">
                            {Math.round((rel.confidence || 0) * 100)}%
                          </span>
                          <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.round((rel.confidence || 0) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Evidence */}
                      <td className="py-2.5 px-3.5 max-w-xs">
                        <p className="text-[11px] text-slate-600 italic line-clamp-2">
                          "{rel.evidence}"
                        </p>
                      </td>

                      {/* Case Context */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {rel.case_id ? (
                          <button
                            onClick={() => navigate(`/cases/${rel.case_id}`)}
                            className="font-mono text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {rel.case_id}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Cross-Case</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {rel.detection_method}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
