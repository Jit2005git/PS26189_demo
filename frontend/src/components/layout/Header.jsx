import React, { useState, useEffect, useRef } from 'react';
import { Search, User, FolderOpen, Loader2, X, Bot, Shield, ChevronRight, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';

const ROUTE_TITLES = {
  '/dashboard': 'Investigation Command Center',
  '/cases': 'Case Records Registry',
  '/entities': 'Associated Persons Directory',
  '/search': 'Advanced Multi-Vector Search',
  '/network': 'Network Investigation Workspace',
  '/analytics': 'Graph Intelligence & Network Analytics',
  '/priority': 'Prioritized Analytical Leads',
  '/assistant': 'AI Investigation Assistant',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive title from route
  const currentTitle = ROUTE_TITLES[location.pathname] || 
    (location.pathname.startsWith('/cases/') ? 'Case Dossier' : 
     location.pathname.startsWith('/entities/') ? 'Person Investigation Profile' : 'Investigation Console');

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
    <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between relative z-40 shrink-0">
      {/* Page Context Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <span>{currentTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            AI-Assisted Investigation & Relational Evidence Verification
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Global Live Search */}
        <div className="relative" ref={dropdownRef}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search persons, cases, identifiers…" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            className="pl-9 pr-8 py-1.5 border border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-72 bg-slate-950 text-slate-100 placeholder-slate-400 transition-all"
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded"
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-84 bg-slate-900 rounded-xl shadow-2xl border border-slate-700/80 py-2 max-h-80 overflow-y-auto animate-fadeIn z-50">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400 text-center">
                  No matching entities or case records found.
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Matches ({results.length})
                  </div>
                  {results.slice(0, 10).map((item) => {
                    const isCase = item.match_type === 'case' || item.type === 'CASE' || item.type === 'CASE_ID';

                    return (
                      <button
                        key={`${item.id}-${item.type}`}
                        onClick={() => handleSelectResult(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-xs transition-colors"
                      >
                        <div className={`p-1.5 rounded-md shrink-0 ${isCase ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                          {isCase ? <FolderOpen size={13} /> : <User size={13} />}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-semibold text-slate-200 truncate">
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
              {/* Link to Advanced Search */}
              <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs mt-1">
                <span className="text-[10px] text-slate-400">
                  {results.length} total matches
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Open in Advanced Search →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Direct Shortcut */}
        <button
          onClick={() => navigate('/assistant')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all shadow-sm cursor-pointer"
          title="Open AI Investigation Assistant"
        >
          <Bot size={14} className="text-indigo-400" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
        </button>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 hover:text-slate-100 hover:bg-slate-700/60 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme mode"
        >
          {isDark ? (
            <Sun size={15} className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
          ) : (
            <Moon size={15} className="text-indigo-400 hover:-rotate-12 transition-transform duration-200" />
          )}
        </button>

        {/* System Online Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
          <span className="font-medium text-[11px]">System Online</span>
        </div>
      </div>
    </header>
  );
}
