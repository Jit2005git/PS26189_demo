import React from 'react';
import { FolderOpen, MapPin, Calendar, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OFFENCE_COLORS = {
  'Cyber Crime': 'bg-purple-100 text-purple-800 border-purple-200',
  'Extortion': 'bg-rose-100 text-rose-800 border-rose-200',
  'Kidnapping': 'bg-amber-100 text-amber-800 border-amber-200',
  'Financial Fraud': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Narcotics': 'bg-red-100 text-red-800 border-red-200',
  'Theft': 'bg-blue-100 text-blue-800 border-blue-200',
  'Homicide': 'bg-stone-100 text-stone-800 border-stone-200',
  'Smuggling': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function PersonCasesTable({ cases = [] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Associated Case Records</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {cases.length} {cases.length === 1 ? 'Case' : 'Cases'} Linked
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Click any case record to inspect case dossier and evidence graph.
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
          No cases directly associated with this person record.
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const offenceClass = OFFENCE_COLORS[c.offence_category] || 'bg-slate-100 text-slate-800 border-slate-200';
            const isClosed = (c.status || '').toUpperCase() === 'CLOSED';

            return (
              <div
                key={c.case_id}
                onClick={() => navigate(`/cases/${c.case_id}`)}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all space-y-3 group"
              >
                {/* Header row: ID, FIR, Offence, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {c.case_id}
                    </span>
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.fir_number || 'FIR Unassigned'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${offenceClass}`}>
                      {c.offence_category}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isClosed 
                        ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-slate-400' : 'bg-amber-500'}`} />
                      {c.status || 'OPEN'}
                    </span>
                  </div>

                  {/* Role in case */}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Role: {c.role || 'ASSOCIATE'}
                  </span>
                </div>

                {/* Title and Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                      {c.legal_section || 'Section N/A'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {c.date_opened || 'Date Unknown'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {c.police_station || 'Central PS'}, {c.district || 'Headquarters'}
                    </span>
                  </div>
                </div>

                {/* Association Narrative */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                  "{c.association_narrative || 'Associated with registered case record.'}"
                </div>

                {/* Card footer CTA */}
                <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Source: {c.source || 'STRUCTURED_METADATA'}
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                    <span>Inspect Case Dossier</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
