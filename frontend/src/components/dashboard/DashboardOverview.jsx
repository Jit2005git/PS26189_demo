import { useState, useEffect } from 'react';
import { FolderOpen, Users, Network, Link } from 'lucide-react';
import api from '../../api/client';
import StatCard from '../common/StatCard';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/summary');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setError(err.message || 'Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Cases" 
        value={data?.total_cases || 0} 
        icon={FolderOpen} 
        loading={loading} 
        error={error} 
      />
      <StatCard 
        title="Total Entities" 
        value={data?.total_entities || 0} 
        icon={Users} 
        loading={loading} 
        error={error} 
      />
      <StatCard 
        title="Total Relationships" 
        value={data?.total_relationships || 0} 
        icon={Link} 
        loading={loading} 
        error={error} 
      />
      <StatCard 
        title="Network Nodes" 
        value={data?.total_network_nodes || 0} 
        icon={Network} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
}
