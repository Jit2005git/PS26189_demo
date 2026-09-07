import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FolderOpen, Users, Search, Network, 
  BarChart3, AlertTriangle, Bot, ShieldCheck, Activity
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'INVESTIGATION',
    items: [
      { name: 'Cases', path: '/cases', icon: FolderOpen },
      { name: 'People', path: '/entities', icon: Users },
      { name: 'Advanced Search', path: '/search', icon: Search },
      { name: 'Network', path: '/network', icon: Network },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Priority Leads', path: '/priority', icon: AlertTriangle },
    ],
  },
  {
    title: 'AI & INTELLIGENCE',
    items: [
      { name: 'Investigation Assistant', path: '/assistant', icon: Bot },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800/80 shrink-0 select-none">
      {/* Platform Branding */}
      <div className="px-5 py-4 border-b border-slate-800/70 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Activity size={18} />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
            PS26189 INTEL
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Network Analysis System
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`
                }
              >
                <item.icon size={16} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/70 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-mono text-[10px]">v1.2.0 • PROTOTYPE</span>
        <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ACTIVE
        </span>
      </div>
    </aside>
  );
}
