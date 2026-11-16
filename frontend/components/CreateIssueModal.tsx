import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IssueType, IssuePriority, IssueStatus } from '../types';
import {
  X,
  Bug,
  Bookmark,
  CheckSquare,
  Zap,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { IssuePriorityIcon, getPriorityLabel } from './IssueBadges';

export const CreateIssueModal: React.FC = () => {
  const {
    isCreateIssueOpen,
    setIsCreateIssueOpen,
    currentProject,
    currentUser,
    users,
    createIssue,
    setSelectedIssueId,
  } = useApp();

  const [type, setType] = useState<IssueType>('BUG');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('HIGH');
  const [status, setStatus] = useState<IssueStatus>('TO_DO');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser?.id || '');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(3);
  const [labelsInput, setLabelsInput] = useState('backend, performance');
  const [attachmentData, setAttachmentData] = useState<{
    name: string;
    size: string;
    url: string;
    type: 'image' | 'log';
  } | null>(null);

  // Only people who are members of the project can be assigned (the backend enforces this too)
  const assignableUsers = currentProject
      ? users.filter((u) => currentProject.members.some((m) => m.userId === u.id))
      : [];

  // Each time the dialog opens, start with a clean form
  useEffect(() => {
    if (isCreateIssueOpen && currentUser) {
      setTitle('');
      setDescription('');
      setAttachmentData(null);
      setAssigneeId(assignableUsers.some((u) => u.id === currentUser.id) ? currentUser.id : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateIssueOpen]);

  if (!isCreateIssueOpen || !currentProject || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedLabels = labelsInput
        .split(',')
        .map((l) => l.trim().toLowerCase())
        .filter(Boolean);

    const newIssue = await createIssue({
      projectId: currentProject.id,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      assigneeId: assigneeId || undefined,
      reporterId: currentUser.id,
      storyPoints,
      sprint: 'Sprint 14',
      labels: parsedLabels,
      components: ['Core API'],
      dueDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0],
    });

    setIsCreateIssueOpen(false);
    setSelectedIssueId(newIssue.id);
  };

  const loadBugTemplate = () => {
    setType('BUG');
    setPriority('HIGHEST');
    setDescription(`### Problem Description
[Describe what went wrong]

### Steps to Reproduce
1. Navigate to /api/issues
2. Submit concurrent POST payload
3. Observe error response

### Expected vs Actual
- **Expected**: HTTP 201 Created with JSON schema
- **Actual**: HTTP 500 InternalServerError (Deadlock)

### Environment
- Java 21, Spring Boot 3.3, PostgreSQL 16`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentData({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        url: reader.result as string,
        type: isImage ? 'image' : 'log',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Create New Issue</h2>
              <p className="text-xs text-slate-500 font-mono">
                Project: {currentProject.name} ({currentProject.key})
              </p>
            </div>
            <button
                onClick={() => setIsCreateIssueOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Issue Type Selector */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Issue Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'BUG' as IssueType, label: 'Bug', icon: Bug, color: 'text-rose-600' },
                  { type: 'STORY' as IssueType, label: 'Story', icon: Bookmark, color: 'text-emerald-600' },
                  { type: 'TASK' as IssueType, label: 'Task', icon: CheckSquare, color: 'text-blue-600' },
                  { type: 'EPIC' as IssueType, label: 'Epic', icon: Zap, color: 'text-purple-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = type === item.type;
                  return (
                      <button
                          key={item.type}
                          type="button"
                          onClick={() => setType(item.type)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                              isSelected
                                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-medium uppercase tracking-wider text-[11px]">
                  Summary <span className="text-rose-500">*</span>
                </label>
                <button
                    type="button"
                    onClick={loadBugTemplate}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Fill Bug Template</span>
                </button>
              </div>
              <input
                  type="text"
                  required
                  placeholder="e.g. Spring Boot JWT filter rejects lowercase bearer token"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                Description
              </label>
              <textarea
                  rows={5}
                  placeholder="Provide reproduction steps, expected behavior, logs, or user acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800"
              />
            </div>

            {/* Row of metadata selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priority */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                  Priority
                </label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as IssuePriority)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((pr) => (
                      <option key={pr} value={pr}>
                        {getPriorityLabel(pr)}
                      </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                  Initial Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                  Assignee
                </label>
                <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Points & Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                  Story Points
                </label>
                <select
                    value={storyPoints ?? ''}
                    onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">None (Unestimated)</option>
                  {[1, 2, 3, 5, 8, 13, 21].map((pts) => (
                      <option key={pts} value={pts}>
                        {pts} Story Points
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                  Labels (comma-separated)
                </label>
                <input
                    type="text"
                    placeholder="e.g. backend, security, bug"
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Upload Trigger */}
            <div className="pt-2">
              <label className="flex items-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
                <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex-1 truncate">
                  {attachmentData ? (
                      <span className="font-medium text-emerald-600 truncate">
                    Attached: {attachmentData.name} ({attachmentData.size})
                  </span>
                  ) : (
                      <span>Attach reproduction screenshot or crash log (optional)</span>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                  type="button"
                  onClick={() => setIsCreateIssueOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};