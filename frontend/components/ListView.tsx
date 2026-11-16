import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Issue, IssueStatus } from '../types';
import {
  IssueTypeIcon,
  IssuePriorityIcon,
  getStatusLabel,
  getPriorityLabel,
} from './IssueBadges';
import {
  ArrowUpDown,
  Trash2,
} from 'lucide-react';

export const ListView: React.FC = () => {
  const {
    filteredIssues,
    setSelectedIssueId,
    users,
    updateIssue,
    deleteIssue,
    currentUser,
    showToast,
  } = useApp();

  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'key' | 'priority' | 'updatedAt' | 'points'>('updatedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const canDeleteAny = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIssueIds(filteredIssues.map((i) => i.id));
    } else {
      setSelectedIssueIds([]);
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIssueIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = (newStatus: IssueStatus) => {
    selectedIssueIds.forEach((id) => {
      updateIssue(id, { status: newStatus });
    });
    setSelectedIssueIds([]);
  };

  const handleBatchDelete = () => {
    if (!canDeleteAny) {
      showToast(`Role ${currentUser?.role} cannot delete issues.`, 'error');
      return;
    }
    selectedIssueIds.forEach((id) => deleteIssue(id));
    setSelectedIssueIds([]);
  };

  const priorityWeight = {
    HIGHEST: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    LOWEST: 1,
  };

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let diff = 0;
    if (sortField === 'key') {
      diff = a.key.localeCompare(b.key);
    } else if (sortField === 'priority') {
      diff = priorityWeight[a.priority] - priorityWeight[b.priority];
    } else if (sortField === 'points') {
      diff = (a.storyPoints || 0) - (b.storyPoints || 0);
    } else {
      diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Batch Actions Bar */}
      {selectedIssueIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 font-medium text-blue-900">
            <span className="font-mono font-bold">{selectedIssueIds.length}</span>
            <span>issues selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Batch status:</span>
            {(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleBatchStatus(st)}
                className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-blue-800 font-medium cursor-pointer transition-colors"
              >
                {getStatusLabel(st)}
              </button>
            ))}
            {canDeleteAny && (
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded text-rose-700 font-medium cursor-pointer transition-colors ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* High-density Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold tracking-wider text-[11px] uppercase">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIssueIds.length === filteredIssues.length &&
                      filteredIssues.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => toggleSort('key')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Key</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[280px]">Summary</th>
                <th
                  onClick={() => toggleSort('priority')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 w-32">Status</th>
                <th className="py-2.5 px-3 w-40">Assignee</th>
                <th
                  onClick={() => toggleSort('points')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors w-20"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Points</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('updatedAt')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors w-32"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Updated</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {sortedIssues.map((issue) => {
                const assignee = users.find((u) => u.id === issue.assigneeId);
                const isSelected = selectedIssueIds.includes(issue.id);

                return (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="py-2 px-3" onClick={(e) => handleToggleSelect(issue.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-2 px-3 font-mono text-slate-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <IssueTypeIcon type={issue.type} className="w-3.5 h-3.5" />
                        <span className="hover:text-blue-600">{issue.key}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {issue.title}
                      </div>
                      {issue.labels.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                          {issue.labels.slice(0, 3).map((l) => (
                            <span key={l}>#{l}</span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <IssuePriorityIcon priority={issue.priority} className="w-3.5 h-3.5" />
                        <span>{getPriorityLabel(issue.priority)}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700 font-mono text-[11px]">
                        {getStatusLabel(issue.status)}
                      </span>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      {assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-slate-800 truncate max-w-[120px]">
                            {assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {issue.storyPoints ?? '—'}
                    </td>

                    <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(issue.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}

              {sortedIssues.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No issues match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
