import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import NetworkPage from './pages/NetworkPage';
import PlaceholderPage from './components/common/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          <Route path="cases" element={
            <PlaceholderPage 
              title="Cases" 
              description="Manage and investigate assigned intelligence cases." 
            />
          } />
          
          {/* Step 15B: Interactive network visualization */}
          <Route path="network" element={<NetworkPage />} />
          
          <Route path="entities" element={
            <PlaceholderPage 
              title="Entities" 
              description="Explore all known individuals, organizations, and assets." 
            />
          } />
          
          <Route path="analytics" element={
            <PlaceholderPage 
              title="Analytics" 
              description="Deep topological insights and pattern detection." 
            />
          } />
          
          <Route path="priority" element={
            <PlaceholderPage 
              title="Investigation Priority" 
              description="Detailed list of all prioritized analytical leads." 
            />
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
