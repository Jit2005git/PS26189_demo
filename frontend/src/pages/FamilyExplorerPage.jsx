import React, { useState, useEffect } from 'react';
import { 
  Users, HeartHandshake, ShieldAlert, ArrowLeft, ExternalLink, 
  User, CheckCircle2, AlertCircle, Briefcase, MapPin, 
  Calendar, Shield, GitFork, ArrowRight, ArrowDown, FolderOpen
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const SUBTYPE_CONFIG = {
  'FATHER': { color: 'text-blue-700 bg-blue-50 border-blue-200', category: 'Parents', label: 'Father' },
  'MOTHER': { color: 'text-pink-700 bg-pink-50 border-pink-200', category: 'Parents', label: 'Mother' },
  'SPOUSE': { color: 'text-purple-700 bg-purple-50 border-purple-200', category: 'Spouse', label: 'Spouse' },
  'BROTHER': { color: 'text-teal-700 bg-teal-50 border-teal-200', category: 'Siblings', label: 'Brother' },
  'SISTER': { color: 'text-teal-700 bg-teal-50 border-teal-200', category: 'Siblings', label: 'Sister' },
  'CHILD': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', category: 'Children', label: 'Child' },
  'SON': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', category: 'Children', label: 'Son' },
  'DAUGHTER': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', category: 'Children', label: 'Daughter' },
  'OTHER': { color: 'text-slate-700 bg-slate-50 border-slate-200', category: 'Other', label: 'Relative' }
};

export default function FamilyExplorerPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'members' | 'investigative'

  useEffect(() => {
    let isMounted = true;
    const fetchFamily = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/entities/${entityId}/family`);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to load family dossier from registry.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFamily();
    return () => {
      isMounted = false;
    };
  }, [entityId]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => navigate(`/entities/${entityId}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} /> Back to Person Dossier
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Family Dossier Unavailable</h3>
            <p className="text-xs text-rose-700 mt-1">{error || 'Record not found in synthetic database.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    person_id,
    person_name,
    demographics,
    family_relationships = [],
    grouped_family = {},
    counts_by_type = {},
    separate_investigative_context = {}
  } = data;

  const parents = [...(grouped_family.FATHER || []), ...(grouped_family.MOTHER || [])];
  const spouses = grouped_family.SPOUSE || [];
  const siblings = [...(grouped_family.BROTHER || []), ...(grouped_family.SISTER || [])];
  const children = grouped_family.CHILD || [];
  const others = grouped_family.OTHER || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/entities" className="hover:text-indigo-600 transition-colors">
              Entity Directory
            </Link>
            <span>/</span>
            <Link to={`/entities/${person_id}`} className="hover:text-indigo-600 transition-colors">
              {person_name} ({person_id})
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Civilian Family Explorer</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {person_name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {person_id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <HeartHandshake size={13} />
              {family_relationships.length} Family {family_relationships.length === 1 ? 'Tie' : 'Ties'} Recorded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/entities/${person_id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            Return to Person Profile
          </button>
        </div>
      </div>

      {/* MANDATORY INVESTIGATIVE SAFETY NOTICE */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-950 shadow-xs flex items-start gap-3.5">
        <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <span>Mandatory Investigative Safety Separation Principle</span>
            <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded text-[10px] font-bold">
              FAMILY RELATIONSHIP ≠ CASE INVOLVEMENT ≠ CRIMINALITY
            </span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            Family relationship data is shown strictly as recorded civilian background information. 
            A family relationship does <strong>NOT</strong> imply case involvement, criminality, guilt, or investigative association. 
            Civilian family ties are strictly excluded from automated network edges and investigation priority scoring.
          </p>
        </div>
      </div>

      {/* FAMILY RELATIONSHIP SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parents</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{parents.length}</div>
          <div className="text-[10px] text-slate-400">
            {counts_by_type.father || 0} Father, {counts_by_type.mother || 0} Mother
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Spouse</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{spouses.length}</div>
          <div className="text-[10px] text-slate-400">
            {spouses.length > 0 ? 'Recorded' : 'None registered'}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siblings</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{siblings.length}</div>
          <div className="text-[10px] text-slate-400">
            {counts_by_type.brother || 0} Brother, {counts_by_type.sister || 0} Sister
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Children</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{children.length}</div>
          <div className="text-[10px] text-slate-400">
            {children.length > 0 ? `${children.length} Offspring` : 'None registered'}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Other Relatives</div>
          <div className="text-xl font-black text-slate-900 mt-0.5">{others.length}</div>
          <div className="text-[10px] text-slate-400">
            {others.length > 0 ? 'Recorded' : 'None registered'}
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Recorded</div>
          <div className="text-xl font-black text-indigo-600 mt-0.5">{family_relationships.length}</div>
          <div className="text-[10px] text-slate-400">Civilian registry records</div>
        </div>
      </div>

      {/* TABS FOR EXPLORER VIEWS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeTab === 'tree'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitFork size={14} />
            <span>Family Diagram View</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Grouped Member Details</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {family_relationships.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('investigative')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeTab === 'investigative'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield size={14} />
            <span>Separate Investigative Context</span>
            {separate_investigative_context.members_with_cases_count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {separate_investigative_context.members_with_cases_count}
              </span>
            )}
          </button>
        </div>

        {/* TAB BODY: 1. STRUCTURED FAMILY DIAGRAM / TREE */}
        {activeTab === 'tree' && (
          <div className="p-6 space-y-8">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Structured genealogical tier diagram showing recorded civilian relationships relative to Subject.</span>
              <span className="text-[11px] font-mono text-slate-400">Direction: Subject ↔ Family Member</span>
            </div>

            {family_relationships.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                No recorded family relationships found in synthetic dataset for {person_name} ({person_id}).
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                {/* LEVEL 1: PARENTS */}
                {parents.length > 0 && (
                  <div className="w-full flex flex-col items-center space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Parents Tier
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {parents.map((p) => (
                        <FamilyDiagramNode
                          key={p.related_person_id}
                          member={p}
                          onNavigate={() => navigate(`/entities/${p.related_person_id}`)}
                          onOpenFamily={() => navigate(`/entities/${p.related_person_id}/family`)}
                        />
                      ))}
                    </div>
                    {/* Visual Connector Downward */}
                    <div className="w-0.5 h-6 bg-slate-300" />
                  </div>
                )}

                {/* LEVEL 2: SUBJECT & SPOUSE & SIBLINGS */}
                <div className="w-full flex flex-col items-center space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {/* Siblings on the Left */}
                    {siblings.length > 0 && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                          Siblings
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {siblings.map((s) => (
                            <FamilyDiagramNode
                              key={s.related_person_id}
                              member={s}
                              onNavigate={() => navigate(`/entities/${s.related_person_id}`)}
                              onOpenFamily={() => navigate(`/entities/${s.related_person_id}/family`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Central Subject Node */}
                    <div className="p-4 bg-indigo-50 border-2 border-indigo-600 rounded-xl shadow-sm text-center min-w-[220px] max-w-[280px]">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-600 text-white">
                        Subject of Investigation
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-2">{person_name}</h3>
                      <div className="text-xs font-mono text-indigo-700">{person_id}</div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {demographics.age ? `${demographics.age} yrs • ` : ''}{demographics.gender}
                      </div>
                      {demographics.occupation && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {demographics.occupation}
                        </div>
                      )}
                    </div>

                    {/* Spouse on the Right */}
                    {spouses.length > 0 && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                          Spouse
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {spouses.map((sp) => (
                            <FamilyDiagramNode
                              key={sp.related_person_id}
                              member={sp}
                              onNavigate={() => navigate(`/entities/${sp.related_person_id}`)}
                              onOpenFamily={() => navigate(`/entities/${sp.related_person_id}/family`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Connector Downward if Children exist */}
                  {children.length > 0 && (
                    <div className="w-0.5 h-6 bg-slate-300" />
                  )}
                </div>

                {/* LEVEL 3: CHILDREN */}
                {children.length > 0 && (
                  <div className="w-full flex flex-col items-center space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                      Children Tier
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {children.map((c) => (
                        <FamilyDiagramNode
                          key={c.related_person_id}
                          member={c}
                          onNavigate={() => navigate(`/entities/${c.related_person_id}`)}
                          onOpenFamily={() => navigate(`/entities/${c.related_person_id}/family`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB BODY: 2. GROUPED MEMBER CARDS */}
        {activeTab === 'members' && (
          <div className="p-6 space-y-8">
            {family_relationships.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                No recorded family relationships found for this individual.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Parents Category */}
                {parents.length > 0 && (
                  <FamilyCategorySection
                    title="Parents"
                    subtitle="Recorded biological or legal parents"
                    members={parents}
                    navigate={navigate}
                  />
                )}

                {/* Spouse Category */}
                {spouses.length > 0 && (
                  <FamilyCategorySection
                    title="Spouse"
                    subtitle="Recorded marital partner"
                    members={spouses}
                    navigate={navigate}
                  />
                )}

                {/* Siblings Category */}
                {siblings.length > 0 && (
                  <FamilyCategorySection
                    title="Siblings"
                    subtitle="Recorded brothers and sisters"
                    members={siblings}
                    navigate={navigate}
                  />
                )}

                {/* Children Category */}
                {children.length > 0 && (
                  <FamilyCategorySection
                    title="Children"
                    subtitle="Recorded offspring"
                    members={children}
                    navigate={navigate}
                  />
                )}

                {/* Other Relatives */}
                {others.length > 0 && (
                  <FamilyCategorySection
                    title="Other Relatives"
                    subtitle="Other civilian family connections"
                    members={others}
                    navigate={navigate}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB BODY: 3. SEPARATE INVESTIGATIVE CONTEXT */}
        {activeTab === 'investigative' && (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <Shield size={16} className="text-indigo-600" />
                <span>Isolated Investigative Context</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This section presents case involvement for recorded family members purely as an independent reference. 
                Any case associations listed here are derived strictly from formal case files (<code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded font-mono">case_persons.csv</code>) 
                and must be independently investigated. Civilian family relationships must <strong>never</strong> be used as substitute evidence of guilt or involvement.
              </p>
            </div>

            {separate_investigative_context.records && separate_investigative_context.records.length > 0 ? (
              <div className="space-y-4">
                {separate_investigative_context.records.map((rec) => (
                  <div key={rec.person_id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{rec.person_name}</h4>
                          <span className="font-mono text-xs text-slate-400">({rec.person_id})</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {rec.case_count} {rec.case_count === 1 ? 'Case' : 'Cases'} on File
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-medium">
                          {rec.family_relationship_to_subject}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/entities/${rec.person_id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors self-start"
                      >
                        <span>Inspect Full Dossier</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Independent Case Associations
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {rec.cases.map((c) => (
                          <div 
                            key={c.case_id}
                            onClick={() => navigate(`/cases/${c.case_id}`)}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-700">{c.case_id}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                                  {c.role_in_case}
                                </span>
                              </div>
                              <div className="text-xs text-slate-700 font-medium line-clamp-1">
                                {c.title}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                No recorded family members have independent case associations registered in the system.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual node in the Family Diagram
function FamilyDiagramNode({ member, onNavigate, onOpenFamily }) {
  const conf = SUBTYPE_CONFIG[member.relationship_subtype] || SUBTYPE_CONFIG['OTHER'];
  const isVerified = member.reciprocal_status?.is_verified;

  return (
    <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all w-[240px] space-y-2 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${conf.color}`}>
            {member.relationship_subtype}
          </span>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200" title="Reciprocal relationship verified in database">
              <CheckCircle2 size={10} /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200" title="Source recorded (one-way in dataset)">
              Recorded
            </span>
          )}
        </div>

        <h4 className="font-bold text-slate-900 text-sm mt-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {member.related_person_name}
        </h4>
        <div className="text-[11px] font-mono text-slate-400">{member.related_person_id}</div>

        <div className="text-xs text-slate-600 font-medium mt-1">
          {member.relation_to_subject}
        </div>

        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
          {member.age && <span>{member.age} yrs</span>}
          {member.gender && <span>• {member.gender}</span>}
          {member.occupation && <span>• {member.occupation}</span>}
          {member.city && <span>• {member.city}</span>}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={onOpenFamily}
          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          title="Open their family explorer"
        >
          Family Tree
        </button>
        <button
          onClick={onNavigate}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5"
        >
          Profile →
        </button>
      </div>
    </div>
  );
}

// Sub-component for categorized family sections in Member Details tab
function FamilyCategorySection({ title, subtitle, members, navigate }) {
  return (
    <div className="space-y-3">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="px-2 py-0.2 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {members.length}
          </span>
        </h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m) => {
          const conf = SUBTYPE_CONFIG[m.relationship_subtype] || SUBTYPE_CONFIG['OTHER'];
          const isVerified = m.reciprocal_status?.is_verified;

          return (
            <div
              key={m.family_id || m.related_person_id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${conf.color}`}>
                    {m.relationship_subtype}
                  </span>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      <CheckCircle2 size={10} /> Reciprocal Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      Source Recorded
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {m.related_person_name}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400">{m.related_person_id}</div>
                </div>

                <div className="text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded border border-slate-100">
                  {m.relation_to_subject}
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  {m.age && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Age: {m.age} years ({m.gender})</span>
                    </div>
                  )}
                  {m.occupation && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-slate-400" />
                      <span>Occupation: {m.occupation}</span>
                    </div>
                  )}
                  {m.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{m.locality ? `${m.locality}, ` : ''}{m.city} ({m.district || m.state})</span>
                    </div>
                  )}
                </div>

                {m.notes && (
                  <div className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded">
                    "{m.notes}"
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/entities/${m.related_person_id}/family`)}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  View Family Tree
                </button>
                <button
                  onClick={() => navigate(`/entities/${m.related_person_id}`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  <span>View Profile</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
