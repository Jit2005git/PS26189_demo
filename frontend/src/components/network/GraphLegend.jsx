/**
 * GraphLegend — visual key for node types in the investigation network.
 * Uses both color AND shape/icon text so accessibility is not color-only.
 */

const NODE_TYPES = [
  { type: 'CASE',         label: 'Case',          symbol: '⬡', color: '#6366f1' },
  { type: 'PERSON',       label: 'Person',        symbol: '●', color: '#0ea5e9' },
  { type: 'PHONE',        label: 'Phone',         symbol: '▲', color: '#10b981' },
  { type: 'BANK_ACCOUNT', label: 'Bank Account',  symbol: '◆', color: '#f59e0b' },
  { type: 'VEHICLE',      label: 'Vehicle',       symbol: '■', color: '#8b5cf6' },
  { type: 'LOCATION',     label: 'Location',      symbol: '▼', color: '#ef4444' },
  { type: 'ORGANIZATION', label: 'Organization',  symbol: '★', color: '#ec4899' },
];

export default function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 items-center px-4 py-2 bg-white border-t border-slate-200">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Legend:</span>
      {NODE_TYPES.map(({ type, label, symbol, color }) => (
        <div key={type} className="flex items-center gap-1.5" title={type}>
          <span className="text-base leading-none" style={{ color }}>{symbol}</span>
          <span className="text-xs text-slate-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
