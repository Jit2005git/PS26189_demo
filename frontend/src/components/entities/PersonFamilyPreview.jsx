import React from 'react';
import { Users2, ShieldAlert, AlertTriangle, ExternalLink, HeartHandshake, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SUBTYPE_BADGES = {
  'FATHER': 'bg-blue-100 text-blue-800 border-blue-200',
  'MOTHER': 'bg-pink-100 text-pink-800 border-pink-200',
  'SPOUSE': 'bg-purple-100 text-purple-800 border-purple-200',
  'CHILD': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'SON': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'DAUGHTER': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'BROTHER': 'bg-teal-100 text-teal-800 border-teal-200',
  'SISTER': 'bg-teal-100 text-teal-800 border-teal-200',
};

export default function PersonFamilyPreview({ family = [], subjectName = 'Subject', subjectId = '' }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HeartHandshake size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Family Relationships (Civilian Record)</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {family.length} Recorded
          </span>
        </div>
        {subjectId && (
          <button
            onClick={() => navigate(`/entities/${subjectId}/family`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors self-start"
          >
            <span>Open Dedicated Family Explorer</span>
            <ExternalLink size={12} />
          </button>
        )}
      </div>

      {/* Mandatory Safety Notice: Visually Separated */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-900">MANDATORY INVESTIGATIVE SAFETY RULE</div>
          <p className="text-amber-800 leading-relaxed">
            Family relationship does <strong>NOT</strong> imply case involvement, criminality, or investigative culpability. 
            Civilian family ties are maintained strictly for biological and identification reference. Keep family relationships visually separate from case associations.
          </p>
        </div>
      </div>

      {family.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
          No registered civilian family relationships on file for this person.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {family.map((rel) => {
            const badgeClass = SUBTYPE_BADGES[rel.relationship_subtype] || 'bg-slate-100 text-slate-800 border-slate-200';
            const directionalText = rel.relation_to_subject || `${rel.related_person_name} is the ${rel.relationship_subtype} of ${subjectName}`;

            return (
              <div
                key={rel.family_id || rel.related_person_id}
                onClick={() => {
                  if (rel.related_person_id) {
                    navigate(`/entities/${rel.related_person_id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                      {rel.relationship_subtype}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {rel.related_person_name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400">
                      {rel.related_person_id}
                    </div>
                    <div className="text-xs text-slate-600 font-medium pt-0.5">
                      {directionalText}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <ExternalLink size={13} />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                  "{rel.notes || 'Synthetic family record.'}"
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Non-investigative tie</span>
                  <span className="font-semibold text-indigo-600 group-hover:text-indigo-800">
                    View Profile →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
