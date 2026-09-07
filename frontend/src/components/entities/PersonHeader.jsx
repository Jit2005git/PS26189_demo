import React from 'react';
import { 
  User, Shield, MapPin, Briefcase, GraduationCap, 
  Calendar, Phone, Mail, Home, Network, ArrowLeft, 
  AlertCircle, ExternalLink, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonHeader({ profile, onBack }) {
  const navigate = useNavigate();

  if (!profile) return null;

  const demo = profile.demographics || {};
  const contact = profile.contact || {};
  const primaryAlias = profile.primary_alias;
  const aliases = profile.aliases || [];
  const networkSummary = profile.network_summary || {};
  const primaryCaseId = networkSummary.primary_case_id || 'CASE-001';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Top action and navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors self-start"
        >
          <ArrowLeft size={15} />
          <span>Back to Explorer</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {profile.entity_id}
          </span>
          <button
            onClick={() => navigate(`/network?caseId=${primaryCaseId}`)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            title="Open person's primary case network graph"
          >
            <Network size={14} />
            <span>View Network</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {demo.full_name ? demo.full_name.charAt(0).toUpperCase() : 'P'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {demo.full_name}
              </h1>
              <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                {profile.entity_id}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Synthetic Entity
              </span>
            </div>

            {/* Aliases */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {primaryAlias && (
                <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium border border-slate-200/80">
                  Known Alias: <strong className="text-slate-900 font-semibold">"{primaryAlias}"</strong>
                </span>
              )}
              {aliases.length > 1 && (
                <span className="text-slate-400 text-[11px]">
                  (+{aliases.length - 1} other recorded alias{aliases.length > 2 ? 'es' : ''})
                </span>
              )}
            </div>

            {/* Subtitle / Jurisdiction */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
              <MapPin size={13} className="text-slate-400" />
              <span>
                {demo.city ? `${demo.city}, ` : ''}{demo.district || 'Chhattisgarh'}, {demo.state || 'India'}
                {demo.pin_code ? ` — PIN: ${demo.pin_code}` : ''}
              </span>
            </p>
          </div>
        </div>

        {/* Quick summary stats pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl shrink-0 self-start md:self-auto">
          <div className="text-center px-2">
            <div className="text-base font-bold text-slate-900">{profile.associated_cases ? profile.associated_cases.length : 0}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Cases</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-2">
            <div className="text-base font-bold text-indigo-600">{networkSummary.connected_entities_count ?? 0}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Entities</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-2">
            <div className="text-base font-bold text-emerald-600">{profile.family_relationships ? profile.family_relationships.length : 0}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Family</div>
          </div>
        </div>
      </div>

      {/* Demographic & Contact Details Grid */}
      <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <User size={12} /> Demographics
          </div>
          <div className="text-xs font-semibold text-slate-800">
            {demo.gender || 'Unknown'} {demo.age ? `• ${demo.age} yrs` : ''}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <Calendar size={12} /> Date of Birth
          </div>
          <div className="text-xs font-semibold text-slate-800">
            {demo.date_of_birth || 'Not Recorded'}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <Briefcase size={12} /> Occupation
          </div>
          <div className="text-xs font-semibold text-slate-800 truncate" title={demo.occupation}>
            {demo.occupation || 'Unspecified'}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <GraduationCap size={12} /> Education
          </div>
          <div className="text-xs font-semibold text-slate-800 truncate" title={demo.education}>
            {demo.education || 'Not Recorded'}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <Phone size={12} /> Primary Phone
          </div>
          <div className="text-xs font-semibold text-slate-800 font-mono truncate">
            {contact.phones && contact.phones.length > 0 ? contact.phones[0].phone_number : 'No Phone'}
          </div>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
            <Mail size={12} /> Registered Email
          </div>
          <div className="text-xs font-semibold text-slate-800 font-mono truncate" title={demo.email}>
            {demo.email || 'No Email'}
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">SYNTHETIC DEMONSTRATION DATA: </strong>
          All demographic and biographical details are synthetically generated demonstration records. Analytical lead only. Requires human verification before operational action.
        </div>
      </div>
    </div>
  );
}
