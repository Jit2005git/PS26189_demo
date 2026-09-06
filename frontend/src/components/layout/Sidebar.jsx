import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Network, Users, BarChart3, AlertTriangle } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', path: '/cases', icon: FolderOpen },
  { name: 'Network', path: '/network', icon: Network },
  { name: 'Entities', path: '/entities', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Investigation Priority', path: '/priority', icon: AlertTriangle },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <nav className="flex-1 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-slate-500 border-t border-slate-800">
        <p>v1.0.0-MVP</p>
      </div>
    </aside>
  );
}
