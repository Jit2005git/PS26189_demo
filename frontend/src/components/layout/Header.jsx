import React, { useState, useEffect, useRef } from 'react';
import { Search, User, FolderOpen, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function Header() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data?.results || []);
        setIsOpen(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (item) => {
    setIsOpen(false);
    setQuery('');

    if (item.match_type === 'case' || item.type === 'CASE' || item.type === 'CASE_ID') {
      navigate(`/cases/${item.id}`);
    } else {
      navigate(`/entities/${item.id}`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between relative z-40">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Criminal Network Intelligence System</h1>
        <p className="text-xs text-slate-500 font-medium">AI-Assisted Investigative Analysis</p>
      </div>

      <div className="flex items-center space-x-6">
        {/* Global Search Bar with Live Entity & Case Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search entities, persons, cases…" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-72 bg-slate-50 focus:bg-white transition-all text-slate-800"
          />

          {loading && (
            <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
          )}

          {query && !loading && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete Results Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 max-h-80 overflow-y-auto animate-fadeIn">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-500 text-center">
                  No matching entities or cases found.
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Search Results ({results.length})
                  </div>
                  {results.slice(0, 12).map((item) => {
                    const isCase = item.match_type === 'case' || item.type === 'CASE' || item.type === 'CASE_ID';

                    return (
                      <button
                        key={`${item.id}-${item.type}`}
                        onClick={() => handleSelectResult(item)}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2.5 text-xs transition-colors"
                      >
                        <div className={`p-1.5 rounded-md shrink-0 ${isCase ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {isCase ? <FolderOpen size={13} /> : <User size={13} />}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-semibold text-slate-900 truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {item.id} • {item.type}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Footer link to Advanced Search */}
              <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {results.length} quick matches
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Open in Advanced Search →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}
