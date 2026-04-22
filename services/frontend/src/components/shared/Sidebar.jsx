import { Link, useLocation } from 'react-router-dom';
import { Home, SmilePlus, ClipboardList, Users, Calendar, LogOut, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Mood Tracker', path: '/mood', icon: SmilePlus },
    { name: 'Assessments', path: '/assessments', icon: ClipboardList },
    { name: 'Find Therapist', path: '/therapists', icon: Users },
    { name: 'My Sessions', path: '/sessions', icon: Calendar },
  ];

  const therapistLinks = [
    { name: 'Dashboard', path: '/therapist/dashboard', icon: Home },
    { name: 'Sessions', path: '/therapist/sessions', icon: Calendar },
    { name: 'Availability', path: '/therapist/availability', icon: ClipboardList },
  ];

  const links = user?.role === 'therapist' ? therapistLinks : userLinks;

  return (
    <div className="w-64 bg-accent min-h-screen text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <BrainCircuit className="w-8 h-8 text-secondary" />
        <span className="text-xl font-bold tracking-tight">Well<span className="text-secondary">Nest</span></span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all-smooth ${
                isActive 
                  ? 'bg-secondary text-white shadow-md' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-secondary/70'}`} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-white/60 truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/80 hover:bg-red-500/10 hover:text-red-400 transition-all-smooth"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
