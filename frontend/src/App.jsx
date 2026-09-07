import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import EntitiesPage from './pages/EntitiesPage';
import PersonProfilePage from './pages/PersonProfilePage';
import FamilyExplorerPage from './pages/FamilyExplorerPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import AssistantPage from './pages/AssistantPage';
import NetworkPage from './pages/NetworkPage';
import PlaceholderPage from './components/common/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Step 21B: AI Investigation Assistant */}
          <Route path="assistant" element={<AssistantPage />} />
          
          {/* Step 20: Advanced Search & Investigation Filtering */}
          <Route path="search" element={<AdvancedSearchPage />} />
          
          {/* Step 17: Case Explorer & Case Analysis */}
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:caseId" element={<CasesPage />} />
          
          {/* Step 15B: Interactive network visualization */}
          <Route path="network" element={<NetworkPage />} />
          
          {/* Step 18: Person Investigation Profile & Entity Directory */}
          <Route path="entities" element={<EntitiesPage />} />
          <Route path="entities/:entityId" element={<PersonProfilePage />} />
          
          {/* Step 19: Family & Relationship Explorer */}
          <Route path="entities/:entityId/family" element={<FamilyExplorerPage />} />
          
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
