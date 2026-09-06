import DashboardOverview from '../components/dashboard/DashboardOverview';
import TopLeads from '../components/dashboard/TopLeads';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Intelligence Dashboard</h2>
        <p className="text-slate-500 mt-1">System-wide analytical overview and top priority leads.</p>
      </div>
      
      <DashboardOverview />
      <TopLeads />
    </div>
  );
}
