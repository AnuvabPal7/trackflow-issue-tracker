import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Plus,
  LogOut,
  FolderKanban,
  Kanban,
  List,
  BarChart3,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentProject,
    logout,
    setIsCreateIssueOpen,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const projectKey = currentProject?.key || 'CORE';

  const navLinks = [
    { to: `/projects/${projectKey}/board`, label: 'Board', icon: Kanban },
    { to: `/projects/${projectKey}/list`, label: 'List', icon: List },
    { to: `/projects/${projectKey}/dashboard`, label: 'Insights', icon: BarChart3 },
    { to: '/projects', label: 'All Projects', icon: FolderKanban },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-15">
        {/* Zone 1: Single text element wordmark */}
        <Link to="/projects" className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-blue-700 transition-colors">
            TF
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            TrackFlow
          </span>
        </Link>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 -mb-[1px]'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + user profile & logout button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateIssueOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Issue</span>
          </button>

          {/* User profile & Logout button */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block leading-tight text-left pr-1">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono tracking-tight">
                  {currentUser.role}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign out of TrackFlow"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-100 px-4 py-2 gap-4 text-xs font-medium text-slate-600">
        {navLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`whitespace-nowrap shrink-0 ${
              location.pathname === item.to ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
};
