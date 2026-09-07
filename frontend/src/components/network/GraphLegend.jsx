/**
 * GraphLegend — compact legend illustrating node types and edge semantics.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

const LEGEND_ITEMS = [
  { type: 'CASE', label: 'Case Record', shape: 'Hexagon', color: '#818cf8', bg: 'bg-indigo-400' },
  { type: 'PERSON', label: 'Associated Person', shape: 'Circle', color: '#38bdf8', bg: 'bg-sky-400' },
  { type: 'PHONE', label: 'Phone Identifier', shape: 'Triangle', color: '#34d399', bg: 'bg-emerald-400' },
  { type: 'BANK_ACCOUNT', label: 'Bank Account', shape: 'Diamond', color: '#fbbf24', bg: 'bg-amber-400' },
  { type: 'VEHICLE', label: 'Vehicle Asset', shape: 'Rectangle', color: '#c084fc', bg: 'bg-purple-400' },
  { type: 'LOCATION', label: 'Locality / Address', shape: 'Vee', color: '#f87171', bg: 'bg-red-400' },
  { type: 'ORGANIZATION', label: 'Organization / Business', shape: 'Star', color: '#f472b6', bg: 'bg-pink-400' },
];

export default function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-slate-800 rounded-lg bg-slate-900/90 overflow-hidden select-none">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-indigo-400" />
          <span>Entity Legend</span>
        </div>
        {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-1.5 text-xs">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.type} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg} shrink-0`}></span>
                <span className="text-slate-300 text-[11px] font-medium">{item.label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{item.shape}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Edge Arrow: Target</span>
            <span>Click: Filter Neighborhood</span>
          </div>
        </div>
      )}
    </div>
  );
}
