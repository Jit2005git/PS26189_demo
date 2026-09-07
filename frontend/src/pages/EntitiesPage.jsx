import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Filter, RotateCcw, ChevronRight, 
  MapPin, Phone, Briefcase, FileText, ChevronLeft, 
  ChevronsLeft, ChevronsRight, AlertCircle, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function EntitiesPage() {
  const navigate = useNavigate();

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    let isMounted = true;
    const fetchPersons = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/persons');
        if (isMounted) {
          setPersons(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load entity registry from API.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPersons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter options
  const filterOptions = useMemo(() => {
    const districts = new Set();
    const genders = new Set();

    persons.forEach((p) => {
      if (p.district) districts.add(p.district);
      if (p.gender) genders.add(p.gender);
    });

    return {
      districts: Array.from(districts).sort(),
      genders: Array.from(genders).sort(),
    };
  }, [persons]);

  // Filtered persons
  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const id = (p.person_id || '').toLowerCase();
        const name = (p.full_name || '').toLowerCase();
        const alias = (p.primary_alias || '').toLowerCase();
        const dist = (p.district || '').toLowerCase();
        const occ = (p.occupation || '').toLowerCase();

        const match = id.includes(q) || name.includes(q) || alias.includes(q) || dist.includes(q) || occ.includes(q);
        if (!match) return false;
      }

      if (selectedDistrict && p.district !== selectedDistrict) return false;
      if (selectedGender && p.gender !== selectedGender) return false;

      return true;
    });
  }, [persons, searchQuery, selectedDistrict, selectedGender]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setSelectedGender('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchQuery || selectedDistrict || selectedGender);

  // Pagination
  const totalPages = Math.ceil(filteredPersons.length / pageSize) || 1;
  const paginatedPersons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPersons.slice(start, start + pageSize);
  }, [filteredPersons, currentPage, pageSize]);

  // Stats
  const multiCaseCount = persons.filter((p) => p.linked_cases_count > 1).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entity Directory & Leads</h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {persons.length} Registered Persons
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Investigator-oriented index of persons of interest and civilian records from the synthetic intelligence database.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs self-start md:self-auto">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">SYNTHETIC DEMONSTRATION DATA:</strong> Analytical leads only. Requires human verification.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Indexed Persons</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{persons.length}</div>
            <div className="text-xs text-slate-400 mt-1">Complete synthetic cohort</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Multi-Case Leads</div>
            <div className="text-2xl font-bold text-indigo-600 mt-0.5">{multiCaseCount}</div>
            <div className="text-xs text-slate-400 mt-1">Associated with ≥ 2 cases</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jurisdiction Districts</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{filterOptions.districts.length}</div>
            <div className="text-xs text-slate-400 mt-1">Chhattisgarh operational zone</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <MapPin size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. PERSON-001), alias, occupation, district…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Districts ({filterOptions.districts.length})</option>
              {filterOptions.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Genders</option>
              {filterOptions.genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Reset filters"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredPersons.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{persons.length}</span> persons
          {hasActiveFilters && (
            <span className="text-indigo-600 font-medium ml-1.5">(filter applied)</span>
          )}
        </div>

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

      {/* Persons Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading person directory…</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <div className="font-semibold">{error}</div>
          </div>
        ) : paginatedPersons.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Users size={32} className="mx-auto text-slate-300" />
            <div className="text-slate-600 font-medium">No matching persons found</div>
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
                  <th className="py-3 px-4">Person ID</th>
                  <th className="py-3 px-4">Full Name & Alias</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Telecom Identifier</th>
                  <th className="py-3 px-4">Linked Cases</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedPersons.map((p) => (
                  <tr
                    key={p.person_id}
                    onClick={() => navigate(`/entities/${p.person_id}`)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-indigo-600 group-hover:text-indigo-800">
                        {p.person_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-900">
                        {p.full_name}
                      </div>
                      {p.primary_alias ? (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Alias: <span className="font-medium text-slate-700">"{p.primary_alias}"</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 mt-0.5">No registered alias</div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs">
                      <div className="text-slate-800 font-medium">
                        {p.gender} {p.age ? `• ${p.age}y` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                        {p.occupation || 'Unspecified'}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs">
                      <div className="text-slate-800 font-medium flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        {p.district || 'Headquarters'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.city || 'State Area'}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-xs font-mono text-slate-600">
                      {p.phone_number || 'None on file'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.linked_cases_count > 1 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <FileText size={12} />
                        <span>{p.linked_cases_count} {p.linked_cases_count === 1 ? 'case' : 'cases'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/entities/${p.person_id}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        <span>Inspect Profile</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredPersons.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(currentPage * pageSize, filteredPersons.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredPersons.length}</span> records
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
