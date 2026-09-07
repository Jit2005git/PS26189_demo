import React, { useState, useEffect } from 'react';
import { 
  Search, Users, FolderOpen, Filter, RotateCcw, ArrowRight, 
  ExternalLink, Network, HeartHandshake, ShieldAlert, Phone, 
  MapPin, Briefcase, Calendar, FileText, CheckCircle2, ChevronDown, 
  Layers, AlertCircle, Info, Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function AdvancedSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Mode: 'ALL' | 'PERSON' | 'CASE'
  const [mode, setMode] = useState(searchParams.get('mode')?.toUpperCase() || 'ALL');

  // Search Fields
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [personId, setPersonId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [offence, setOffence] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [organization, setOrganization] = useState('');
  const [minCaseCount, setMinCaseCount] = useState('');
  const [maxCaseCount, setMaxCaseCount] = useState('');

  // Dropdown options
  const [metadata, setMetadata] = useState({
    offence_categories: [],
    districts: [],
    statuses: [],
    years: []
  });

  // State
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Fetch metadata on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/api/search/metadata');
        if (isMounted) {
          setMetadata(res.data);
        }
      } catch (err) {
        console.error('Failed to load search metadata', err);
      }
    };
    fetchMetadata();
    return () => { isMounted = false; };
  }, []);

  // Perform search on mount if URL has 'q'
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      executeSearch({ query: initialQuery, mode: searchParams.get('mode')?.toUpperCase() || 'ALL' });
    } else {
      // Execute broad initial search
      executeSearch({ mode });
    }
  }, []);

  const executeSearch = async (overrideParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        mode: overrideParams.mode || mode,
        query: overrideParams.query !== undefined ? overrideParams.query : (query || undefined),
        name: name || undefined,
        alias: alias || undefined,
        person_id: personId || undefined,
        case_id: caseId || undefined,
        fir_number: firNumber || undefined,
        offence: offence || undefined,
        location: location || undefined,
        district: district || undefined,
        status: status || undefined,
        year: year || undefined,
        phone_prefix: phonePrefix || undefined,
        phone_suffix: phoneSuffix || undefined,
        vehicle: vehicle || undefined,
        organization: organization || undefined,
        min_case_count: minCaseCount ? parseInt(minCaseCount) : undefined,
        max_case_count: maxCaseCount ? parseInt(maxCaseCount) : undefined,
        limit: 100
      };

      const res = await api.post('/api/search/advanced', payload);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search query failed. Please check your parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleReset = () => {
    setQuery('');
    setName('');
    setAlias('');
    setPersonId('');
    setCaseId('');
    setFirNumber('');
    setOffence('');
    setLocation('');
    setDistrict('');
    setStatus('');
    setYear('');
    setPhonePrefix('');
    setPhoneSuffix('');
    setVehicle('');
    setOrganization('');
    setMinCaseCount('');
    setMaxCaseCount('');
    executeSearch({
      query: '',
      mode
    });
  };

  const persons = results?.persons || [];
  const cases = results?.cases || [];
  const totalResults = results?.total_results || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Investigation Dossiers</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Advanced Investigation Search</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
            <Search className="text-indigo-600" size={24} />
            <span>Advanced Search & Investigation Filtering</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic, multi-criteria retrieval across registered persons, case files, telecom identifiers, and locations.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start">
          <ShieldAlert size={14} className="text-amber-600 shrink-0" />
          <span>Analytical Leads Only • Human Verification Required</span>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-3">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-900 uppercase text-[11px] tracking-wider">
            Investigative Neutrality & Safety Separation Notice
          </div>
          <p className="text-amber-900/90 leading-relaxed">
            Search results display formal records from synthetic demonstration files (<code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">persons.csv</code>, <code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">cases.csv</code>, <code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">case_persons.csv</code>). 
            Civilian family relationships are strictly isolated and never used as evidence or filtering criteria. Terms like "criminal" or "guilty" are strictly prohibited.
          </p>
        </div>
      </div>

      {/* Search Query & Filters Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        {/* Top Controls: Mode Tabs + Primary Query */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Search Mode Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button
              type="button"
              onClick={() => { setMode('ALL'); executeSearch({ mode: 'ALL' }); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Unified Search (All)</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('PERSON'); executeSearch({ mode: 'PERSON' }); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === 'PERSON'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              <span>Person Intelligence</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('CASE'); executeSearch({ mode: 'CASE' }); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === 'CASE'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen size={13} />
              <span>Case Files</span>
            </button>
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 self-end md:self-auto"
          >
            <Filter size={13} />
            <span>{showAdvancedFilters ? 'Hide Specific Filters' : 'Show Specific Filters'}</span>
          </button>
        </div>

        {/* General Query Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords, names, aliases, IDs, locations, offence categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Structured Filter Grid */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {/* Person-Specific Filters */}
            {(mode === 'ALL' || mode === 'PERSON') && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Full / Partial Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bhai, Dada"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Person ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PERSON-001"
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Phone Prefix (Starts with)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7454, 9801"
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Phone Suffix (Ends with)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4895, 0004"
                    value={phoneSuffix}
                    onChange={(e) => setPhoneSuffix(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Min Associated Cases
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={minCaseCount}
                    onChange={(e) => setMinCaseCount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Max Associated Cases
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1"
                    value={maxCaseCount}
                    onChange={(e) => setMaxCaseCount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Vehicle Reg / Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH01, Sedan"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            {/* Case & Shared Filters */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Offence Category
              </label>
              <select
                value={offence}
                onChange={(e) => setOffence(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">All Offence Categories</option>
                {metadata.offence_categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Jurisdiction District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">All Districts</option>
                {metadata.districts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                City / Locality / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Kolkata, Raipur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {(mode === 'ALL' || mode === 'CASE') && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Case Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="">All Statuses</option>
                    {metadata.statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Year Opened
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="">All Years</option>
                    {metadata.years.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Case ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CASE-001"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    FIR Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FIR-SYNTH-RAI-0001"
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset All Filters</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Search size={14} />
            <span>{loading ? 'Executing Query...' : 'Apply Filters & Search'}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Results Header with Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-slate-900">
              Search Results
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalResults} Matched Records
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Persons: <strong className="text-slate-800">{persons.length}</strong></span>
            <span>•</span>
            <span>Cases: <strong className="text-slate-800">{cases.length}</strong></span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Zero Results State */}
        {!loading && totalResults === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-sm text-slate-800">No matching investigation records found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No persons or case files matched your specified filter criteria. Try broadening your location, removing phone digit constraints, or resetting the filters.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* 1. MATCHED PERSONS SECTION */}
        {persons.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Users size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Persons Matching Criteria ({persons.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {persons.map((p) => (
                <div
                  key={p.person_id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {p.full_name}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400">{p.person_id}</div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.associated_case_count > 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <FileText size={11} />
                        <span>{p.associated_case_count} Cases</span>
                      </span>
                    </div>

                    {p.aliases && p.aliases.length > 0 && (
                      <div className="text-[11px] text-indigo-700 font-medium bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100/80">
                        Alias: {p.aliases.join(', ')}
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <span className="font-mono">{p.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{p.district || p.city || 'District Area'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={12} className="text-slate-400" />
                        <span>{p.occupation}</span>
                      </div>
                    </div>

                    {/* Deterministic Matching Reasons */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Matched Reasons
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.matching_reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <CheckCircle2 size={10} />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigate(`/entities/${p.person_id}/family`)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                    >
                      <HeartHandshake size={12} />
                      <span>Civilian Family</span>
                    </button>

                    <button
                      onClick={() => navigate(`/entities/${p.person_id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <span>View Dossier</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. MATCHED CASES SECTION */}
        {cases.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <FolderOpen size={16} className="text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Case Files Matching Criteria ({cases.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cases.map((c) => (
                <div
                  key={c.case_id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-700">{c.case_id}</span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
                          {c.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        c.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200 text-[10px]">
                        {c.offence_category}
                      </span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {c.legal_section}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Opened: {c.date_opened}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{c.police_station} • {c.district}</span>
                      </div>
                    </div>

                    {/* Matched Reasons */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Matched Reasons
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.matching_reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <CheckCircle2 size={10} />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigate(`/network?caseId=${c.case_id}`)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      <Network size={12} />
                      <span>Network Graph</span>
                    </button>

                    <button
                      onClick={() => navigate(`/cases/${c.case_id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <span>Case Details</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
