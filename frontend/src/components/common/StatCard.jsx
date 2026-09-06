import { Loader2, AlertCircle } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, loading = false, error = null }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        
        {loading ? (
          <div className="flex items-center space-x-2 mt-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm text-slate-400">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 mt-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Error</span>
          </div>
        ) : (
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        )}
      </div>
      
      <div className="p-3 bg-blue-50 rounded-md text-blue-600">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
