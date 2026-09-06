import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import PriorityBadge from '../common/PriorityBadge';

export default function TopLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPriority = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/priority?limit=5');
        setLeads(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch priority leads:", err);
        setError(err.message || 'Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriority();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Analyzing investigation priorities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium mb-2">Analysis Failed</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-slate-500 font-medium">No prioritized analytical leads found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800">Top Investigation Leads</h3>
        <p className="text-xs text-slate-500 mt-1">Automatically prioritized analytical leads. Requires human verification.</p>
      </div>
      
      <div className="divide-y divide-slate-200">
        {leads.map((lead, idx) => (
          <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-lg font-bold text-slate-900">{lead.entity_id}</h4>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                  {lead.entity_type}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Priority Score</p>
                  <p className="text-lg font-mono font-bold text-slate-800">
                    {Number(lead.priority_score).toFixed(4)}
                  </p>
                </div>
                <PriorityBadge level={lead.priority_level} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Analytical Reasons</p>
                <ul className="list-disc list-inside space-y-1">
                  {lead.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-slate-700">{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Supporting Evidence</p>
                <div className="bg-slate-100 rounded-md p-3 text-sm text-slate-700 border border-slate-200 space-y-2">
                  {lead.supporting_evidence.slice(0, 2).map((evidence, i) => (
                    <p key={i} className="line-clamp-2" title={evidence}>• {evidence}</p>
                  ))}
                  {lead.supporting_evidence.length > 2 && (
                    <p className="text-xs text-blue-600 font-medium">+ {lead.supporting_evidence.length - 2} more connections</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
