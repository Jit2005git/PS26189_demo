import { Search, ShieldAlert } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Criminal Network Intelligence System</h1>
        <p className="text-xs text-slate-500 font-medium">AI-Assisted Investigative Analysis</p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search entities, cases..." 
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-slate-50"
            disabled
          />
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}
