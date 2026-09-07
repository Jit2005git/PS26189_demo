import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Network, Users, Database, Link2, Share2, 
  MapPin, Shield, Calendar, FileText, AlertCircle, Phone, 
  CreditCard, Car, Building2, ExternalLink, CheckCircle, 
  Clock, Hash, ShieldAlert, ChevronRight, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import PersonPreviewModal from './PersonPreviewModal';

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

export default function CaseDetails({ caseId, onBack, onSelectCase }) {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState('persons'); // 'persons' | 'entities' | 'relationships' | 'related_cases'

  // Person Modal
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    if (!caseId) return;

    let isMounted = true;
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/cases/${caseId}`);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load case intelligence details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCaseDetails();
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  if (loading) {
    return (
      <div className="p-16 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">Loading Case Intelligence Dossier</p>
          <p className="text-xs text-slate-500 mt-0.5">Fetching associated entities, relationships, and cross-case leads for {caseId}…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 bg-white rounded-xl border border-red-200 shadow-sm text-center space-y-4">
        <AlertCircle size={36} className="mx-auto text-red-500" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Unable to load case details</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'Case record not found in system.'}</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Return to Case Explorer
        </button>
      </div>
    );
  }

  const details = data.details || {};
  const associatedPersons = data.associated_persons || [];
  const relatedEntities = data.related_entities || { locations: [], phones: [], bank_accounts: [], vehicles: [], organizations: [] };
  const relationships = data.relationships || [];
  const relatedCases = data.related_cases || [];

  const offenceCategory = details.offence_category || 'General Enquiry';
  const offenceBadgeClass = OFFENCE_COLORS[offenceCategory] || 'bg-slate-100 text-slate-800 border-slate-200';
  const isClosed = (details.status || '').toUpperCase() === 'CLOSED';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors self-start"
        >
          <ArrowLeft size={15} />
          <span>Back to Case Explorer</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-mono">
            {caseId}
          </div>
          <button
            onClick={() => navigate(`/network?caseId=${caseId}`)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            title="Open case in interactive cytoscape network graph"
          >
            <Network size={15} />
            <span>View Case Network</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {caseId}
              </span>
              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                {details.fir_number || 'FIR Unassigned'}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${offenceBadgeClass}`}>
                {offenceCategory}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isClosed 
                  ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-slate-400' : 'bg-amber-500'}`} />
                {details.status || 'OPEN'}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              {details.title || details.case_title || `Case Dossier ${caseId}`}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Opened: {details.date_opened || 'Unknown'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <FileText size={13} className="text-slate-400" />
                Legal Section: {details.legal_section || 'N/A'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 shrink-0">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <div className="text-lg font-bold text-slate-900">{associatedPersons.length}</div>
              <div className="text-[11px] text-slate-500">Associated Persons</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <div className="text-lg font-bold text-slate-900">{relatedEntities.total_count ?? 0}</div>
              <div className="text-[11px] text-slate-500">Related Entities</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <div className="text-lg font-bold text-indigo-600">{relationships.length}</div>
              <div className="text-[11px] text-slate-500">Evidence Links</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center min-w-[110px]">
              <div className="text-lg font-bold text-amber-600">{relatedCases.length}</div>
              <div className="text-[11px] text-slate-500">Related Cases</div>
            </div>
          </div>
        </div>

        {/* Description & Jurisdiction Card */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Case Summary / Narrative
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
              {details.description || 'No detailed case record description recorded for this synthetic entry.'}
            </p>
          </div>

          <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 text-xs">
            <div className="font-semibold text-slate-600 uppercase tracking-wider">Jurisdiction</div>
            <div className="space-y-1 text-slate-600">
              <div className="flex items-start gap-1.5">
                <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">{details.district || 'Headquarters'}</span>
                  {details.state ? `, ${details.state}` : ''}
                </div>
              </div>
              <div className="text-slate-500 pl-5">
                PS: {details.police_station || 'Central PS'}
              </div>
              {details.location_id && (
                <div className="text-slate-500 pl-5 font-mono text-[11px]">
                  Loc Ref: {details.location_id}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Investigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('persons')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'persons'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Associated Persons</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-bold">
              {associatedPersons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('entities')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'entities'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database size={14} />
            <span>Related Entities</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {relatedEntities.total_count ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('relationships')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'relationships'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 size={14} />
            <span>Evidence Relationships</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {relationships.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('related_cases')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'related_cases'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 size={14} />
            <span>Cross-Case Leads</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {relatedCases.length}
            </span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* ── TAB 1: Associated Persons ─────────────────────────────────── */}
          {activeTab === 'persons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  Individuals associated with this case record. Click <strong>View Profile</strong> to inspect full cross-case leads.
                </p>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Analytical Lead Only
                </span>
              </div>

              {associatedPersons.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No individual person records directly linked to this case record.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {associatedPersons.map((person) => (
                    <div
                      key={person.person_id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {person.full_name ? person.full_name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{person.full_name}</span>
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded">
                                {person.person_id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {person.primary_alias ? `Alias: "${person.primary_alias}"` : 'No registered alias'}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {person.role || 'ASSOCIATE'}
                        </span>
                      </div>

                      {/* Association Narrative */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                        "{person.association_type || 'Associated with registered case record.'}"
                      </div>

                      {/* Details Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                        <div>
                          <span className="text-slate-400">Demographics:</span>{' '}
                          <span className="text-slate-700 font-medium">
                            {person.gender || 'N/A'}, {person.age ? `${person.age}y` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Occupation:</span>{' '}
                          <span className="text-slate-700 font-medium truncate inline-block max-w-[130px] align-bottom">
                            {person.occupation || 'Unspecified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Location:</span>{' '}
                          <span className="text-slate-700 font-medium">
                            {person.district || person.city || 'Regional Area'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Linked Cases:</span>{' '}
                          <span className="text-indigo-600 font-semibold">
                            {person.linked_cases_count ?? 1} case(s)
                          </span>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Verified synthetic identity
                        </span>
                        <button
                          onClick={() => navigate(`/entities/${person.person_id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <UserCheck size={13} />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: Related Entities ───────────────────────────────────── */}
          {activeTab === 'entities' && (
            <div className="space-y-6">
              {/* Primary Location */}
              {relatedEntities.locations && relatedEntities.locations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-600" />
                    Case Location Registry
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relatedEntities.locations.map((loc) => (
                      <div key={loc.entity_id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                          <MapPin size={16} />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div className="font-semibold text-slate-900">{loc.name}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{loc.entity_id} • {loc.location_type}</div>
                          <div className="text-slate-600">
                            {loc.city && `${loc.city}, `}{loc.district}, {loc.state} {loc.pin_code && `— PIN: ${loc.pin_code}`}
                          </div>
                          <span className="inline-block mt-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                            {loc.relation_to_case}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registered Telecom Numbers */}
              {relatedEntities.phones && relatedEntities.phones.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={14} className="text-emerald-600" />
                    Registered Telecom & Contact Numbers ({relatedEntities.phones.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedEntities.phones.map((ph, idx) => (
                      <div key={`${ph.entity_id}-${idx}`} className="p-3 border border-slate-200 rounded-lg bg-white shadow-xs flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                          <Phone size={15} />
                        </div>
                        <div className="text-xs overflow-hidden">
                          <div className="font-mono font-bold text-slate-900">{ph.number}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Linked: {ph.associated_person_name || ph.associated_person_id || 'Case Lead'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {ph.entity_id} • {ph.phone_type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Accounts */}
              {relatedEntities.bank_accounts && relatedEntities.bank_accounts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} className="text-blue-600" />
                    Financial & Bank Accounts ({relatedEntities.bank_accounts.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedEntities.bank_accounts.map((ba, idx) => (
                      <div key={`${ba.entity_id}-${idx}`} className="p-3 border border-slate-200 rounded-lg bg-white shadow-xs flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                          <CreditCard size={15} />
                        </div>
                        <div className="text-xs overflow-hidden">
                          <div className="font-mono font-bold text-slate-900 truncate">
                            •••• {ba.account_number.slice(-4) || ba.account_number}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{ba.bank_name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            Holder: {ba.associated_person_name || ba.associated_person_id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {relatedEntities.vehicles && relatedEntities.vehicles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Car size={14} className="text-amber-600" />
                    Vehicles Registered to Leads ({relatedEntities.vehicles.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedEntities.vehicles.map((vh, idx) => (
                      <div key={`${vh.entity_id}-${idx}`} className="p-3 border border-slate-200 rounded-lg bg-white shadow-xs flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                          <Car size={15} />
                        </div>
                        <div className="text-xs overflow-hidden">
                          <div className="font-mono font-bold text-slate-900">{vh.registration_number}</div>
                          <div className="text-[11px] text-slate-600">{vh.color} {vh.model} ({vh.vehicle_type})</div>
                          <div className="text-[10px] text-slate-400 truncate">Owner: {vh.associated_person_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations */}
              {relatedEntities.organizations && relatedEntities.organizations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-600" />
                    Commercial & Institutional Entities ({relatedEntities.organizations.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {relatedEntities.organizations.map((org, idx) => (
                      <div key={`${org.entity_id}-${idx}`} className="p-3 border border-slate-200 rounded-lg bg-white shadow-xs flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                          <Building2 size={15} />
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-slate-900">{org.name}</div>
                          <div className="text-[11px] text-slate-500">{org.org_type} • Ref: {org.entity_id}</div>
                          <div className="text-[10px] text-slate-400">Associated: {org.associated_person_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {relatedEntities.total_count === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No additional entity assets (phones, accounts, vehicles) linked directly to this case.
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Evidence Relationships ─────────────────────────────── */}
          {activeTab === 'relationships' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  Evidence-backed relationships detected via telecom analysis, financial records, and graph extraction.
                </p>
                <button
                  onClick={() => navigate(`/network?caseId=${caseId}`)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Network size={13} /> Open Visual Network
                </button>
              </div>

              {relationships.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No cross-entity relationships indexed for this case record.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Source Lead</th>
                        <th className="py-2.5 px-3">Relationship Type</th>
                        <th className="py-2.5 px-3">Target Lead</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3">Evidence Snippet / Provenance</th>
                        <th className="py-2.5 px-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {relationships.map((rel, idx) => (
                        <tr key={rel.relationship_id || idx} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{rel.source_label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{rel.source_id}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {rel.relationship_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-900">{rel.target_label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{rel.target_id}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800">
                                {Math.round((rel.confidence || 0) * 100)}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.round((rel.confidence || 0) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <p className="text-[11px] text-slate-600 italic line-clamp-2">
                              "{rel.evidence}"
                            </p>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {rel.detection_method}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: Related Cases (Cross-Case Network) ──────────────────── */}
          {activeTab === 'related_cases' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Cross-case network intelligence: other cases sharing associated person leads, assets, or network connections.
              </div>

              {relatedCases.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No cross-case linkages detected for this case. This case is currently isolated in the registry.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedCases.map((rc) => (
                    <div
                      key={rc.case_id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {rc.case_id}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {rc.offence_category}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                            {rc.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{rc.district || 'Chhattisgarh'}</p>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          rc.link_strength === 'HIGH' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {rc.link_strength === 'HIGH' ? 'Direct Multi-Link' : 'Network Lead'}
                        </span>
                      </div>

                      {/* Connection Reason */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                        <div className="font-semibold text-slate-600 mb-0.5">Linkage Provenance:</div>
                        <div>{rc.reason}</div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Cross-Case Investigation
                        </span>
                        <button
                          onClick={() => onSelectCase(rc.case_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                        >
                          <span>Switch to Case</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Person Preview Modal for Step 18 preparation */}
      {selectedPerson && (
        <PersonPreviewModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSelectCase={(cid) => {
            setSelectedPerson(null);
            onSelectCase(cid);
          }}
        />
      )}
    </div>
  );
}
