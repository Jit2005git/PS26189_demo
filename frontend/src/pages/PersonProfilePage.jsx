import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderOpen, Database, HeartHandshake, Network, Target, 
  AlertCircle, ArrowLeft, Loader2, Shield
} from 'lucide-react';
import api from '../api/client';
import PersonHeader from '../components/entities/PersonHeader';
import PersonCasesTable from '../components/entities/PersonCasesTable';
import PersonAssets from '../components/entities/PersonAssets';
import PersonFamilyPreview from '../components/entities/PersonFamilyPreview';
import PersonNetworkSummary from '../components/entities/PersonNetworkSummary';
import PersonEvidenceRelationships from '../components/entities/PersonEvidenceRelationships';
import PersonPriorityAnalytics from '../components/entities/PersonPriorityAnalytics';

export default function PersonProfilePage() {
  const { entityId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'assets' | 'family' | 'network' | 'analytics'

  useEffect(() => {
    if (!entityId) return;

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/entities/${entityId}`);
        if (isMounted) {
          setProfile(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Person record not found in synthetic database.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [entityId]);

  if (loading) {
    return (
      <div className="p-16 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">Compiling Person Investigation Profile</p>
          <p className="text-xs text-slate-500 mt-0.5">Fetching records, associated cases, assets, and family linkages for {entityId}…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12 bg-white rounded-xl border border-red-200 shadow-sm text-center space-y-4">
        <AlertCircle size={36} className="mx-auto text-red-500" />
        <div>
          <h2 className="text-base font-bold text-slate-900">Entity Record Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'No matching person record found.'}</p>
        </div>
        <button
          onClick={() => navigate('/entities')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Entity Explorer</span>
        </button>
      </div>
    );
  }

  const cases = profile.associated_cases || [];
  const assets = profile.assets || {};
  const family = profile.family_relationships || [];
  const relationships = profile.evidence_relationships || [];
  const networkSummary = profile.network_summary || {};
  const priority = profile.priority_information;
  const graphMetrics = profile.graph_metrics || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. PERSON HEADER */}
      <PersonHeader
        profile={profile}
        onBack={() => navigate('/entities')}
      />

      {/* 2. TABBED DOSSIER SECTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'cases'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen size={14} />
            <span>Associated Cases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-bold">
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'assets'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database size={14} />
            <span>Assets & Accounts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {assets.total_assets_count ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'family'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake size={14} />
            <span>Family Record (Civilian)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {family.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'network'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network size={14} />
            <span>Network & Evidence</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {relationships.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target size={14} />
            <span>Priority & Analytics</span>
            {priority && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {priority.priority_level || 'LEAD'}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'cases' && (
            <PersonCasesTable cases={cases} />
          )}

          {activeTab === 'assets' && (
            <PersonAssets assets={assets} />
          )}

          {activeTab === 'family' && (
            <PersonFamilyPreview
              family={family}
              subjectName={profile.demographics?.full_name || 'Subject'}
              subjectId={entityId}
            />
          )}

          {activeTab === 'network' && (
            <div className="space-y-8">
              <PersonNetworkSummary
                summary={networkSummary}
                personId={entityId}
                fullName={profile.demographics?.full_name}
              />
              <div className="pt-4 border-t border-slate-200">
                <PersonEvidenceRelationships
                  relationships={relationships}
                  personId={entityId}
                />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <PersonPriorityAnalytics
              priority={priority}
              graphMetrics={graphMetrics}
            />
          )}
        </div>
      </div>
    </div>
  );
}
