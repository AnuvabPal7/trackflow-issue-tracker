import React from 'react';
import { useApp } from '../context/AppContext';
import { IssueType, IssuePriority, IssueStatus } from '../types';
import { IssueTypeIcon, IssuePriorityIcon, getTypeLabel, getPriorityLabel } from './IssueBadges';
import { CheckCircle2, TrendingUp, AlertTriangle, Users, Target } from 'lucide-react';

export const AgileDashboard: React.FC = () => {
  const { currentProjectIssues, users } = useApp();

  const totalIssues = currentProjectIssues.length;
  const doneIssues = currentProjectIssues.filter((i) => i.status === 'DONE').length;
  const inProgressIssues = currentProjectIssues.filter((i) => i.status === 'IN_PROGRESS').length;
  const inReviewIssues = currentProjectIssues.filter((i) => i.status === 'IN_REVIEW').length;
  const backlogIssues = currentProjectIssues.filter((i) => i.status === 'BACKLOG' || i.status === 'TO_DO').length;

  const totalPoints = currentProjectIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = currentProjectIssues
    .filter((i) => i.status === 'DONE')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  const completionPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Counts by type
  const typeCounts: Record<IssueType, number> = {
    BUG: currentProjectIssues.filter((i) => i.type === 'BUG').length,
    STORY: currentProjectIssues.filter((i) => i.type === 'STORY').length,
    TASK: currentProjectIssues.filter((i) => i.type === 'TASK').length,
    EPIC: currentProjectIssues.filter((i) => i.type === 'EPIC').length,
  };

  // Counts by priority
  const priorityCounts: Record<IssuePriority, number> = {
    HIGHEST: currentProjectIssues.filter((i) => i.priority === 'HIGHEST').length,
    HIGH: currentProjectIssues.filter((i) => i.priority === 'HIGH').length,
    MEDIUM: currentProjectIssues.filter((i) => i.priority === 'MEDIUM').length,
    LOW: currentProjectIssues.filter((i) => i.priority === 'LOW').length,
    LOWEST: currentProjectIssues.filter((i) => i.priority === 'LOWEST').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sprint Completion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Sprint Velocity</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {donePoints}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalPoints} story pts</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono text-right">{completionPct}% finished</div>
        </div>

        {/* Active In-Flight */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">In Development</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {inProgressIssues + inReviewIssues}
            </span>
            <span className="text-xs text-slate-500">tickets in progress / review</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>{inProgressIssues} developing</span>
            <span aria-hidden="true">·</span>
            <span>{inReviewIssues} reviewing</span>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Closed &amp; Deployed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {doneIssues}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalIssues} total</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {totalIssues - doneIssues} tickets remaining in backlog &amp; to do
          </div>
        </div>

        {/* Critical Blockers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Critical &amp; High</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {priorityCounts.HIGHEST + priorityCounts.HIGH}
            </span>
            <span className="text-xs text-slate-500">urgent priorities</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {priorityCounts.HIGHEST} blocker · {typeCounts.BUG} bugs identified
          </div>
        </div>
      </div>

      {/* Middle Section: Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Type Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Composition by Issue Type
          </h3>
          <div className="space-y-3 text-xs">
            {(['BUG', 'STORY', 'TASK', 'EPIC'] as IssueType[]).map((t) => {
              const count = typeCounts[t];
              const pct = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
              return (
                <div key={t} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IssueTypeIcon type={t} className="w-4 h-4" />
                      <span className="font-medium text-slate-800">{getTypeLabel(t)}</span>
                    </div>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        t === 'BUG'
                          ? 'bg-rose-500'
                          : t === 'STORY'
                          ? 'bg-emerald-500'
                          : t === 'TASK'
                          ? 'bg-blue-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Priority Distribution
          </h3>
          <div className="space-y-3 text-xs">
            {(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((p) => {
              const count = priorityCounts[p];
              const pct = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IssuePriorityIcon priority={p} className="w-4 h-4" />
                      <span className="font-medium text-slate-800">{getPriorityLabel(p)}</span>
                    </div>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        p === 'HIGHEST'
                          ? 'bg-rose-600'
                          : p === 'HIGH'
                          ? 'bg-amber-500'
                          : p === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Member Workload Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Engineer Workload &amp; Assignment Balance
          </h3>
          <span className="text-xs text-slate-400 font-mono">{users.length} active team members</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((member) => {
            const memberIssues = currentProjectIssues.filter((i) => i.assigneeId === member.id);
            const memberPoints = memberIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
            const doneCount = memberIssues.filter((i) => i.status === 'DONE').length;

            return (
              <div
                key={member.id}
                className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate flex-1">
                    <div className="font-semibold text-slate-900 truncate">{member.name}</div>
                    <div className="text-[11px] text-slate-500">{member.title}</div>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-200/80 font-mono text-[11px]">
                  <span>{memberIssues.length} ticket{memberIssues.length === 1 ? '' : 's'}</span>
                  <span>{memberPoints} pts</span>
                  <span className="text-emerald-600 font-medium">{doneCount} resolved</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
