import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Issue, IssueStatus } from '../types';
import { useApp } from '../context/AppContext';
import { IssueTypeIcon, IssuePriorityIcon } from './IssueBadges';
import { Paperclip, MessageSquare, ArrowRight, ArrowLeft, GripVertical } from 'lucide-react';

interface KanbanCardProps {
  issue: Issue;
  isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ issue, isOverlay = false }) => {
  const { setSelectedIssueId, users, moveIssueStatus, canEditIssue } = useApp();

  const isEditable = canEditIssue(issue);
  const assignee = users.find((u) => u.id === issue.assigneeId);

  const statusOrder: IssueStatus[] = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  const currentIndex = statusOrder.indexOf(issue.status);
  const prevStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    disabled: !isEditable, // Developers can only drag/move issues they can edit
    data: {
      type: 'ISSUE',
      issue,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setSelectedIssueId(issue.id)}
      className={`group relative bg-white border rounded-lg p-3 transition-all select-none cursor-pointer ${
        isOverlay
          ? 'shadow-xl ring-2 ring-blue-500 border-blue-500 rotate-1'
          : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
      }`}
    >
      {/* Top Header: Drag Handle, Type Icon, Monospace Key, Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {isEditable && (
            <div
              {...attributes}
              {...listeners}
              className="touch-none p-0.5 -ml-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing"
              title="Drag to transition status"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          <IssueTypeIcon type={issue.type} className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
            {issue.key}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {issue.storyPoints !== undefined && (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
              {issue.storyPoints} pt{issue.storyPoints === 1 ? '' : 's'}
            </span>
          )}
          <IssuePriorityIcon priority={issue.priority} className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 mb-2.5">
        {issue.title}
      </p>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mb-2.5">
          {issue.labels.slice(0, 2).map((label, idx) => (
            <React.Fragment key={label}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <span className="text-slate-500 font-mono">#{label}</span>
            </React.Fragment>
          ))}
          {issue.labels.length > 2 && (
            <span className="text-slate-400">+{issue.labels.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer: Metadata & Assignee */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {issue.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-slate-500" title={`${issue.attachments.length} attachment(s)`}>
              <Paperclip className="w-3 h-3" />
              <span className="font-mono text-[10px]">{issue.attachments.length}</span>
            </span>
          )}
          {issue.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-slate-500" title={`${issue.comments.length} comment(s)`}>
              <MessageSquare className="w-3 h-3" />
              <span className="font-mono text-[10px]">{issue.comments.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick status navigation buttons (shown on hover if user can edit this issue) */}
          {isEditable && (
            <div className="hidden group-hover:flex items-center gap-1">
              {prevStatus && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveIssueStatus(issue.id, prevStatus);
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                  title={`Move backward to ${prevStatus.replace('_', ' ')}`}
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
              )}
              {nextStatus && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveIssueStatus(issue.id, nextStatus);
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                  title={`Move forward to ${nextStatus.replace('_', ' ')}`}
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Assignee Avatar */}
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
              title={`Assigned to ${assignee.name}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400"
              title="Unassigned"
            >
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
