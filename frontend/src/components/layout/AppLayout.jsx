import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import SafetyBanner from './SafetyBanner';

export default function AppLayout() {
  const location = useLocation();
  // Network page needs its own internal scroll / full-height canvas
  const isNetwork = location.pathname.startsWith('/network');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <SafetyBanner />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {isNetwork ? (
          // Network page: no scroll wrapper, fills available height
          <main className="flex-1 overflow-hidden relative flex flex-col">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto relative">
            <Outlet />
            <footer className="mt-8 border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-slate-50">
              Decision-support system. Human verification required.
            </footer>
          </main>
        )}
      </div>
    </div>
  );
}
