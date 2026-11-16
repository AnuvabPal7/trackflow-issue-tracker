import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueType, IssuePriority } from '../types';
import {
  Search,
  X,
  Filter,
  Plus,
  Settings,
  ChevronDown,
  Check,
} from 'lucide-react';
import { IssueTypeIcon, IssuePriorityIcon, getTypeLabel, getPriorityLabel } from './IssueBadges';

export const WorkspaceToolbar: React.FC = () => {
  const {
    currentProject,
    projects,
    setCurrentProjectKey,
    setIsProjectSettingsOpen,
    setIsNewProjectOpen,
    filters,
    setFilters,
    resetFilters,
    users,
    filteredIssues,
    currentProjectIssues,
    canManageProject,
    canDeleteProject,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const projRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projRef.current && !projRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentProject) return null;

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.types.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeId !== 'ALL' ||
    filters.quickFilter !== 'ALL';

  const toggleTypeFilter = (type: IssueType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const togglePriorityFilter = (priority: IssuePriority) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const handleSelectProject = (key: string) => {
    setCurrentProjectKey(key);
    setIsProjectDropdownOpen(false);
    // Keep current subpath (/board, /list, /dashboard)
    const subpath = location.pathname.includes('/list')
      ? 'list'
      : location.pathname.includes('/dashboard')
      ? 'dashboard'
      : 'board';
    navigate(`/projects/${key}/${subpath}`);
  };

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Top row: Project Selector & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Project Switcher */}
          <div className="relative" ref={projRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left group"
            >
              <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                {currentProject.key.slice(0, 2)}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {currentProject.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Key: {currentProject.key} · {currentProject.members.length} members
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors text-left cursor-pointer ${
                      currentProject.id === proj.id ? 'bg-blue-50/70 text-blue-900 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {proj.key}
                      </span>
                      <span className="truncate">{proj.name}</span>
                    </div>
                    {currentProject.id === proj.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}

                {canDeleteProject() && (
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsNewProjectOpen(true);
                        setIsProjectDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors text-left font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Project</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Settings button - Only enabled for Admin & Manager */}
          {canManageProject() ? (
            <button
              onClick={() => setIsProjectSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Project settings and member management"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings &amp; Team</span>
            </button>
          ) : (
            <button
              onClick={() => setIsProjectSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              title="View team roster"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Team Roster</span>
            </button>
          )}
        </div>

        {/* Right side stats summary */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <span>{filteredIssues.length} of {currentProjectIssues.length} issues</span>
          <span aria-hidden="true">·</span>
          <span>Sprint 14 Active</span>
        </div>
      </div>

      {/* Bottom row: Search input, Assignee avatars, Quick filter tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search summary, key, labels..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Segmented Buttons */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, quickFilter: 'ALL' }))}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filters.quickFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  quickFilter: prev.quickFilter === 'MY_ISSUES' ? 'ALL' : 'MY_ISSUES',
                }))
              }
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filters.quickFilter === 'MY_ISSUES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Only My Issues
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  quickFilter: prev.quickFilter === 'HIGH_PRIORITY_BUGS' ? 'ALL' : 'HIGH_PRIORITY_BUGS',
                }))
              }
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filters.quickFilter === 'HIGH_PRIORITY_BUGS'
                  ? 'bg-white text-rose-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Critical Bugs
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  quickFilter: prev.quickFilter === 'RECENT' ? 'ALL' : 'RECENT',
                }))
              }
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filters.quickFilter === 'RECENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recently Updated
            </button>
          </div>
        </div>

        {/* Assignee filter avatars + Dropdown Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center -space-x-1.5" title="Filter by assignee">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, assigneeId: 'ALL' }))}
              className={`w-7 h-7 rounded-full text-[10px] font-medium flex items-center justify-center border-2 border-white cursor-pointer transition-transform hover:scale-105 ${
                filters.assigneeId === 'ALL'
                  ? 'bg-blue-600 text-white z-10'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              ALL
            </button>
            {users.map((u) => {
              const isSelected = filters.assigneeId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      assigneeId: isSelected ? 'ALL' : u.id,
                    }))
                  }
                  className={`relative cursor-pointer transition-transform hover:scale-110 ${
                    isSelected ? 'ring-2 ring-blue-600 ring-offset-1 z-10' : ''
                  }`}
                  title={`${u.name} (${u.role})`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    referrerPolicy="no-referrer"
                  />
                </button>
              );
            })}
          </div>

          {/* More Filters (Type & Priority) */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                filters.types.length > 0 || filters.priorities.length > 0
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>More Filters</span>
              {(filters.types.length > 0 || filters.priorities.length > 0) && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {filters.types.length + filters.priorities.length}
                </span>
              )}
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-40 text-xs">
                <div className="font-semibold text-slate-900 mb-2">Issue Types</div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {(['BUG', 'STORY', 'TASK', 'EPIC'] as IssueType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTypeFilter(t)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-left cursor-pointer transition-colors ${
                        filters.types.includes(t)
                          ? 'border-blue-400 bg-blue-50 text-blue-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <IssueTypeIcon type={t} className="w-3.5 h-3.5" />
                      <span>{getTypeLabel(t)}</span>
                    </button>
                  ))}
                </div>

                <div className="font-semibold text-slate-900 mb-2">Priority</div>
                <div className="space-y-1 mb-3">
                  {(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePriorityFilter(p)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded border text-left cursor-pointer transition-colors ${
                        filters.priorities.includes(p)
                          ? 'border-blue-400 bg-blue-50 text-blue-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IssuePriorityIcon priority={p} className="w-3.5 h-3.5" />
                        <span>{getPriorityLabel(p)}</span>
                      </div>
                      {filters.priorities.includes(p) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setIsFilterDropdownOpen(false);
                    }}
                    className="w-full py-1 text-center text-slate-500 hover:text-slate-800 text-[11px] font-medium border-t border-slate-100 pt-2 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Clear all active filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
