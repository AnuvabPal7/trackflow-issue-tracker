import React from 'react';
import { IssueType, IssuePriority, IssueStatus } from '../types';
import {
  Bug,
  Bookmark,
  CheckSquare,
  Zap,
  ChevronsUp,
  ChevronUp,
  Equal,
  ChevronDown,
  ChevronsDown,
} from 'lucide-react';

export const IssueTypeIcon: React.FC<{ type: IssueType; className?: string }> = ({
  type,
  className = 'w-4 h-4',
}) => {
  switch (type) {
    case 'BUG':
      return <Bug className={`${className} text-rose-600 shrink-0`} aria-label="Bug" />;
    case 'STORY':
      return <Bookmark className={`${className} text-emerald-600 shrink-0`} aria-label="Story" />;
    case 'TASK':
      return <CheckSquare className={`${className} text-blue-600 shrink-0`} aria-label="Task" />;
    case 'EPIC':
      return <Zap className={`${className} text-purple-600 shrink-0`} aria-label="Epic" />;
    default:
      return <CheckSquare className={`${className} text-slate-500 shrink-0`} />;
  }
};

export const IssuePriorityIcon: React.FC<{ priority: IssuePriority; className?: string }> = ({
  priority,
  className = 'w-4 h-4',
}) => {
  switch (priority) {
    case 'HIGHEST':
      return <ChevronsUp className={`${className} text-rose-600 shrink-0`} aria-label="Highest priority" />;
    case 'HIGH':
      return <ChevronUp className={`${className} text-amber-600 shrink-0`} aria-label="High priority" />;
    case 'MEDIUM':
      return <Equal className={`${className} text-yellow-600 shrink-0`} aria-label="Medium priority" />;
    case 'LOW':
      return <ChevronDown className={`${className} text-blue-500 shrink-0`} aria-label="Low priority" />;
    case 'LOWEST':
      return <ChevronsDown className={`${className} text-slate-400 shrink-0`} aria-label="Lowest priority" />;
    default:
      return <Equal className={`${className} text-slate-400 shrink-0`} />;
  }
};

export const getStatusLabel = (status: IssueStatus): string => {
  switch (status) {
    case 'BACKLOG':
      return 'Backlog';
    case 'TO_DO':
      return 'To Do';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'IN_REVIEW':
      return 'In Review';
    case 'DONE':
      return 'Done';
  }
};

export const getPriorityLabel = (priority: IssuePriority): string => {
  switch (priority) {
    case 'HIGHEST':
      return 'Highest';
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    case 'LOWEST':
      return 'Lowest';
  }
};

export const getTypeLabel = (type: IssueType): string => {
  switch (type) {
    case 'BUG':
      return 'Bug';
    case 'STORY':
      return 'Story';
    case 'TASK':
      return 'Task';
    case 'EPIC':
      return 'Epic';
  }
};
