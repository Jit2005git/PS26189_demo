import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, RotateCcw, FolderGit2, ChevronRight, 
  Network, Users, MapPin, Calendar, ShieldAlert, CheckCircle2,
  Clock, AlertCircle, FileText, ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
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

export default function CaseExplorer({ cases, loading, error, onSelectCase }) {
  const navigate = useNavigate();

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffence, setSelectedOffence] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Extract unique filter options from dataset
  const filterOptions = useMemo(() => {
    const offences = new Set();
    const districts = new Set();
    const stations = new Set();
    const statuses = new Set();
    const years = new Set();

    cases.forEach((c) => {
      const d = c.details || {};
      if (d.offence_category) offences.add(d.offence_category);
      if (d.district) districts.add(d.district);
      if (d.police_station) stations.add(d.police_station);
      if (d.status) statuses.add(d.status);
      if (d.date_opened) {
        const yr = d.date_opened.split('-')[0];
        if (yr) years.add(yr);
      }
    });

    return {
      offences: Array.from(offences).sort(),
      districts: Array.from(districts).sort(),
      stations: Array.from(stations).sort(),
      statuses: Array.from(statuses).sort(),
      years: Array.from(years).sort().reverse(),
    };
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const d = c.details || {};
      const id = (c.id || '').toLowerCase();
      const title = (d.title || d.case_title || '').toLowerCase();
      const fir = (d.fir_number || '').toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const dist = (d.district || '').toLowerCase();
      const stn = (d.police_station || '').toLowerCase();
      const cat = (d.offence_category || '').toLowerCase();
      const stat = (d.status || '').toUpperCase();
      const year = d.date_opened ? d.date_opened.split('-')[0] : '';

      // Text query match across core fields
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          id.includes(q) || 
          title.includes(q) || 
          fir.includes(q) || 
          desc.includes(q) || 
          dist.includes(q) ||
          stn.includes(q) ||
          cat.includes(q);
        if (!matchesQuery) return false;
      }

      if (selectedOffence && d.offence_category !== selectedOffence) return false;
      if (selectedDistrict && d.district !== selectedDistrict) return false;
      if (selectedStation && d.police_station !== selectedStation) return false;
      if (selectedStatus && d.status !== selectedStatus) return false;
      if (selectedYear && year !== selectedYear) return false;

      return true;
    });
  }, [cases, searchQuery, selectedOffence, selectedDistrict, selectedStation, selectedStatus, selectedYear]);

  // Reset pagination on filter change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedOffence('');
    setSelectedDistrict('');
    setSelectedStation('');
    setSelectedStatus('');
    setSelectedYear('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedOffence || selectedDistrict || selectedStation || selectedStatus || selectedYear
  );

  // Pagination slicing
  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  // Statistical counters
  const stats = useMemo(() => {
    const total = cases.length;
    let active = 0;
    let closed = 0;
    let withGraph = 0;
    let multiPerson = 0;

    cases.forEach((c) => {
      const d = c.details || {};
      const status = (d.status || '').toUpperCase();
      if (status === 'CLOSED') closed++;
      else active++;

      if (d.has_graph_relationships || (d.evidence_count && d.evidence_count > 0)) {
        withGraph++;
      }
      if (d.associated_persons_count && d.associated_persons_count > 1) {
        multiPerson++;
      }
    });

    return { total, active, closed, withGraph, multiPerson };
  }, [cases]);

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Explorer</h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {cases.length} Registered Cases
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Multi-field case registry and network entry point. Inspect associated persons, entity linkages, and relationship provenance.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs self-start md:self-auto">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">SYNTHETIC DEMONSTRATION DATA:</strong> Analytical leads only. Requires human verification.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Indexed</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1">Complete case inventory</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Investigations</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{stats.active}</div>
            <div className="text-xs text-slate-400 mt-1">{stats.closed} cases marked closed</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Network Connected</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5">{stats.withGraph}</div>
            <div className="text-xs text-slate-400 mt-1">Has intelligence graph leads</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Network size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Multi-Person Cases</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.multiPerson}</div>
            <div className="text-xs text-slate-400 mt-1">≥ 2 linked person leads</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Case ID, FIR, Title, District, Police Station, Keyword..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-slate-100">
          {/* Offence Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Offence
            </label>
            <select
              value={selectedOffence}
              onChange={(e) => handleFilterChange(setSelectedOffence, e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All Offences ({filterOptions.offences.length})</option>
              {filterOptions.offences.map((off) => (
                <option key={off} value={off}>{off}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleFilterChange(setSelectedDistrict, e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All Districts ({filterOptions.districts.length})</option>
              {filterOptions.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Police Station */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Police Station
            </label>
            <select
              value={selectedStation}
              onChange={(e) => handleFilterChange(setSelectedStation, e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white truncate"
            >
              <option value="">All Police Stations ({filterOptions.stations.length})</option>
              {filterOptions.stations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Year Opened
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(setSelectedYear, e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All Years</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredCases.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{cases.length}</span> cases
          {hasActiveFilters && (
            <span className="text-indigo-600 font-medium ml-1.5">
              (active filter applied)
            </span>
          )}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Case Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading synthetic case inventory…</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <div className="font-semibold">{error}</div>
            <p className="text-xs text-slate-500">Ensure the backend service is running at localhost:8000.</p>
          </div>
        ) : paginatedCases.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <FileText size={32} className="mx-auto text-slate-300" />
            <div className="text-slate-600 font-medium">No matching cases found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try refining your search terms or clearing the active filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Case ID / FIR</th>
                  <th className="py-3 px-4">Case Title & Legal Section</th>
                  <th className="py-3 px-4">Offence Category</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Leads & Graph</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedCases.map((c) => {
                  const d = c.details || {};
                  const offenceClass = OFFENCE_COLORS[d.offence_category] || 'bg-slate-100 text-slate-800 border-slate-200';
                  const isClosed = (d.status || '').toUpperCase() === 'CLOSED';
                  const hasGraph = d.has_graph_relationships || (d.evidence_count && d.evidence_count > 0);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                    >
                      {/* ID & FIR */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1.5">
                          {c.id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {d.fir_number || 'FIR-N/A'}
                        </div>
                      </td>

                      {/* Title & Section */}
                      <td className="py-3 px-4 max-w-xs md:max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-900">
                          {d.title || d.case_title || `Case ${c.id}`}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {d.legal_section || 'Section N/A'}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            {d.date_opened || 'Date Unspecified'}
                          </span>
                        </div>
                      </td>

                      {/* Offence Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${offenceClass}`}>
                          {d.offence_category || 'General'}
                        </span>
                      </td>

                      {/* Jurisdiction */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          {d.district || 'Headquarters'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                          {d.police_station || 'Central Station'}
                        </div>
                      </td>

                      {/* Leads & Graph */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full" title="Associated Person Leads">
                            <Users size={12} className="text-slate-500" />
                            <span>{d.associated_persons_count ?? 0}</span>
                          </span>

                          {hasGraph ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Intelligence Graph Available">
                              <Network size={11} /> Graph
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Isolated</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isClosed 
                            ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-slate-400' : 'bg-amber-500'}`} />
                          {d.status || 'OPEN'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectCase(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            title="Inspect Case Intelligence"
                          >
                            <span>Inspect</span>
                            <ChevronRight size={13} />
                          </button>

                          <button
                            onClick={() => navigate(`/network?caseId=${c.id}`)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                            title="Open in Network Graph"
                          >
                            <Network size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredCases.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, filteredCases.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredCases.length}</span> records
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-2 py-0.5 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
