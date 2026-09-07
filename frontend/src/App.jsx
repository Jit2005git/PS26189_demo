import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import EntitiesPage from './pages/EntitiesPage';
import PersonProfilePage from './pages/PersonProfilePage';
import FamilyExplorerPage from './pages/FamilyExplorerPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import AssistantPage from './pages/AssistantPage';
import NetworkPage from './pages/NetworkPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PriorityPage from './pages/PriorityPage';
import RegisterCasePage from './pages/RegisterCasePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Step 21B: AI Investigation Assistant */}
          <Route path="assistant" element={<AssistantPage />} />
          
          {/* Step 20: Advanced Search & Investigation Filtering */}
          <Route path="search" element={<AdvancedSearchPage />} />
          
          {/* Step 17 & 27: Case Explorer, Register Case & Case Analysis */}
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/new" element={<RegisterCasePage />} />
          <Route path="cases/:caseId" element={<CasesPage />} />
          
          {/* Step 15B & 26: Interactive Network Investigation Workspace */}
          <Route path="network" element={<NetworkPage />} />
          
          {/* Step 18: Person Investigation Profile & Entity Directory */}
          <Route path="entities" element={<EntitiesPage />} />
          <Route path="entities/:entityId" element={<PersonProfilePage />} />
          <Route path="person/:entityId" element={<PersonProfilePage />} />
          
          {/* Step 19: Family & Relationship Explorer */}
          <Route path="family" element={<FamilyExplorerPage />} />
          <Route path="family/:entityId" element={<FamilyExplorerPage />} />
          <Route path="entities/:entityId/family" element={<FamilyExplorerPage />} />
          
          {/* Step 26: Dedicated Graph Analytics & Intelligence */}
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* Step 26: Dedicated Prioritized Analytical Leads */}
          <Route path="priority" element={<PriorityPage />} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}
