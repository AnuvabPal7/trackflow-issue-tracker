import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useApp } from '../context/AppContext';
import { Issue, IssueStatus } from '../types';
import { KanbanCard } from './KanbanCard';
import { Plus, AlertCircle } from 'lucide-react';

interface ColumnConfig {
  status: IssueStatus;
  label: string;
  wipLimit?: number;
}

const COLUMNS: ColumnConfig[] = [
  { status: 'BACKLOG', label: 'Backlog' },
  { status: 'TO_DO', label: 'To Do', wipLimit: 8 },
  { status: 'IN_PROGRESS', label: 'In Progress', wipLimit: 3 },
  { status: 'IN_REVIEW', label: 'In Review', wipLimit: 4 },
  { status: 'DONE', label: 'Done' },
];

const DroppableColumn: React.FC<{
  column: ColumnConfig;
  issues: Issue[];
  onAddClick: () => void;
}> = ({ column, issues, onAddClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
    data: {
      type: 'COLUMN',
      status: column.status,
    },
  });

  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const isOverWip = column.wipLimit !== undefined && issues.length > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col rounded-xl border transition-all duration-150 min-w-[220px] max-w-[280px] p-2.5 ${
        isOver
          ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300/30'
          : 'bg-slate-100/80 border-slate-200/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            {column.label}
          </h3>
          <span
            className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
              isOverWip ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {issues.length}
            {column.wipLimit && `/${column.wipLimit}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {totalPoints > 0 && (
            <span className="text-[10px] text-slate-400 font-mono" title="Total story points">
              {totalPoints} pts
            </span>
          )}
          <button
            onClick={onAddClick}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title={`Create issue in ${column.label}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WIP Warning Alert */}
      {isOverWip && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700 leading-tight">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>WIP limit exceeded ({issues.length}/{column.wipLimit})</span>
        </div>
      )}

      {/* Sortable Cards Container */}
      <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
          {issues.map((issue) => (
            <KanbanCard key={issue.id} issue={issue} />
          ))}

          {issues.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 text-xs select-none">
              No issues in {column.label}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { filteredIssues, moveIssueStatus, setIsCreateIssueOpen } = useApp();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Configure pointer and touch sensors with activation distance/delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = filteredIssues.find((i) => i.id === active.id);
    if (found) {
      setActiveIssue(found);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target status
    let targetStatus: IssueStatus | null = null;

    // If dropped directly onto a column
    const isColumn = COLUMNS.some((c) => c.status === overId);
    if (isColumn) {
      targetStatus = overId as IssueStatus;
    } else {
      // Dropped onto another issue card
      const targetIssue = filteredIssues.find((i) => i.id === overId);
      if (targetIssue) {
        targetStatus = targetIssue.status;
      }
    }

    if (targetStatus) {
      moveIssueStatus(activeId, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-slate-50 min-h-[calc(100vh-140px)]">
        <div className="flex items-start gap-4 min-w-[1100px] max-w-7xl mx-auto">
          {COLUMNS.map((column) => {
            const colIssues = filteredIssues.filter((i) => i.status === column.status);
            return (
              <DroppableColumn
                key={column.status}
                column={column}
                issues={colIssues}
                onAddClick={() => setIsCreateIssueOpen(true)}
              />
            );
          })}
        </div>
      </div>

      {/* Drag Overlay during touch / mouse dragging */}
      <DragOverlay>
        {activeIssue ? <KanbanCard issue={activeIssue} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
