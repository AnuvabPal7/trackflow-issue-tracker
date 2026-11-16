import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  IssueStatus,
  IssuePriority,
  IssueType,
} from '../types';
import {
  IssueTypeIcon,
  IssuePriorityIcon,
  getStatusLabel,
  getPriorityLabel,
  getTypeLabel,
} from './IssueBadges';
import {
  X,
  Trash2,
  Paperclip,
  Send,
  Upload,
  Check,
  Copy,
  MessageSquare,
  History,
  FileText,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';

export const IssueDetailModal: React.FC = () => {
  const {
    selectedIssueId,
    setSelectedIssueId,
    issues,
    updateIssue,
    deleteIssue,
    addComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    users,
    currentUser,
    canEditIssue,
    canDeleteIssue,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COMMENTS' | 'ACTIVITY'>('COMMENTS');
  const [newCommentText, setNewCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [newLabelDraft, setNewLabelDraft] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const issue = issues.find((i) => i.id === selectedIssueId);
  if (!issue) return null;

  const isEditable = canEditIssue(issue);
  const isDeletable = canDeleteIssue(issue);

  const assignee = users.find((u) => u.id === issue.assigneeId);
  const reporter = users.find((u) => u.id === issue.reporterId);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(issue.key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleDelete = () => {
    if (!isDeletable) return;
    if (window.confirm(`Permanently delete ticket ${issue.key}?`)) {
      deleteIssue(issue.id);
    }
  };

  const handleSaveTitle = () => {
    if (titleDraft.trim() && isEditable) {
      updateIssue(issue.id, { title: titleDraft.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    if (isEditable) {
      updateIssue(issue.id, { description: descDraft });
    }
    setIsEditingDesc(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(issue.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      addAttachment(issue.id, {
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        url: result,
        type: isImage ? 'image' : 'log',
        rawFile: file,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddLabel = () => {
    if (!isEditable) return;
    const trimmed = newLabelDraft.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (trimmed && !issue.labels.includes(trimmed)) {
      updateIssue(issue.id, { labels: [...issue.labels, trimmed] });
      setNewLabelDraft('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    if (!isEditable) return;
    updateIssue(issue.id, {
      labels: issue.labels.filter((l) => l !== labelToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IssueTypeIcon type={issue.type} className="w-4 h-4" />
              <button
                onClick={handleCopyKey}
                className="font-mono text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Click to copy issue key"
              >
                <span>{issue.key}</span>
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">Sprint 14</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete button only visible to Admin & Manager */}
            {isDeletable && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSelectedIssueId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Developer read-only notice if not assignee/reporter */}
        {!isEditable && (
          <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 text-slate-600 text-xs flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Read-only: As a Developer, you can edit only tickets assigned to or created by you. You can still post comments and view files.</span>
          </div>
        )}

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Main Left Pane */}
          <div className="lg:col-span-2 p-6 space-y-6">
            {/* Title Section */}
            <div>
              {isEditingTitle && isEditable ? (
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-base font-semibold text-slate-900 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => {
                    if (isEditable) {
                      setTitleDraft(issue.title);
                      setIsEditingTitle(true);
                    }
                  }}
                  className={`text-lg font-semibold text-slate-900 leading-snug ${
                    isEditable ? 'hover:bg-slate-50 p-1 -m-1 rounded cursor-pointer' : ''
                  }`}
                  title={isEditable ? 'Click to edit summary' : undefined}
                >
                  {issue.title}
                </h2>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </h3>
                {isEditable && !isEditingDesc && (
                  <button
                    onClick={() => {
                      setDescDraft(issue.description);
                      setIsEditingDesc(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingDesc && isEditable ? (
                <div className="space-y-2">
                  <textarea
                    rows={8}
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-blue-500 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDesc}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Save Description
                    </button>
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (isEditable) {
                      setDescDraft(issue.description);
                      setIsEditingDesc(true);
                    }
                  }}
                  className={`p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans ${
                    isEditable ? 'cursor-pointer hover:border-slate-200' : ''
                  }`}
                >
                  {issue.description || (
                    <span className="text-slate-400 italic">No description provided.</span>
                  )}
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Attachments ({issue.attachments.length})
                  </h3>
                </div>

                <label className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {issue.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issue.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="relative group border border-slate-200 rounded-lg p-2.5 bg-white hover:border-blue-400 transition-all text-xs"
                    >
                      <div className="flex items-start gap-2">
                        {att.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        ) : (
                          <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="truncate flex-1">
                          <p className="font-medium text-slate-800 truncate" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{att.size}</p>
                        </div>
                      </div>

                      {att.type === 'image' && att.url.startsWith('data:') && (
                        <div className="mt-2 rounded overflow-hidden max-h-24 bg-slate-100">
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      )}

                      {isEditable && (
                        <button
                          onClick={() => deleteAttachment(issue.id, att.id)}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-opacity"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400">
                    No files attached. Upload reproduction screenshots or logs.
                  </p>
                </div>
              )}
            </div>

            {/* Comments & Activity */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setActiveTab('COMMENTS')}
                  className={`flex items-center gap-1.5 text-xs font-semibold pb-1 cursor-pointer transition-colors ${
                    activeTab === 'COMMENTS'
                      ? 'text-blue-600 border-b-2 border-blue-600 -mb-[9px]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({issue.comments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('ACTIVITY')}
                  className={`flex items-center gap-1.5 text-xs font-semibold pb-1 cursor-pointer transition-colors ${
                    activeTab === 'ACTIVITY'
                      ? 'text-blue-600 border-b-2 border-blue-600 -mb-[9px]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Activity History ({issue.activityLogs.length})</span>
                </button>
              </div>

              {activeTab === 'COMMENTS' ? (
                <div className="space-y-4">
                  {currentUser && (
                    <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Add a comment to collaborate..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                        />
                        {newCommentText.trim() && (
                          <button
                            type="submit"
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Save Comment</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  <div className="space-y-3 pt-2">
                    {issue.comments.map((comment) => {
                      const author = users.find((u) => u.id === comment.authorId);
                      const canDeleteThisComment =
                        currentUser?.role === 'ADMIN' ||
                        currentUser?.role === 'MANAGER' ||
                        currentUser?.id === comment.authorId;

                      return (
                        <div
                          key={comment.id}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/60 border border-slate-100 text-xs"
                        >
                          <img
                            src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                            alt={author?.name || 'User'}
                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800">
                                  {author?.name || 'User'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {canDeleteThisComment && (
                                <button
                                  onClick={() => deleteComment(issue.id, comment.id)}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {issue.activityLogs.map((log) => {
                    const logUser = users.find((u) => u.id === log.userId);
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-800">{logUser?.name || 'User'}</span>
                          <span className="text-slate-600">{log.action}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="p-6 bg-slate-50/50 space-y-5 text-xs">
            {/* Status Dropdown */}
            <div>
              <label className="block text-slate-500 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Status
              </label>
              <select
                disabled={!isEditable}
                value={issue.status}
                onChange={(e) => updateIssue(issue.id, { status: e.target.value as IssueStatus })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                {(['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as IssueStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {getStatusLabel(st)}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  Assignee
                </label>
                {isEditable && issue.assigneeId !== currentUser?.id && currentUser && (
                  <button
                    onClick={() => updateIssue(issue.id, { assigneeId: currentUser.id })}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Assign to me
                  </button>
                )}
              </div>
              <select
                disabled={!isEditable}
                value={issue.assigneeId || ''}
                onChange={(e) => updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-slate-500 font-medium mb-1 uppercase tracking-wider text-[11px]">
                Reporter
              </label>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                <img
                  src={reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt={reporter?.name}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium">{reporter?.name || 'System'}</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-500 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Priority
              </label>
              <select
                disabled={!isEditable}
                value={issue.priority}
                onChange={(e) => updateIssue(issue.id, { priority: e.target.value as IssuePriority })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                {(['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as IssuePriority[]).map((pr) => (
                  <option key={pr} value={pr}>
                    {getPriorityLabel(pr)}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-slate-500 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Issue Type
              </label>
              <select
                disabled={!isEditable}
                value={issue.type}
                onChange={(e) => updateIssue(issue.id, { type: e.target.value as IssueType })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                {(['BUG', 'STORY', 'TASK', 'EPIC'] as IssueType[]).map((tp) => (
                  <option key={tp} value={tp}>
                    {getTypeLabel(tp)}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-slate-500 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Story Points
              </label>
              <select
                disabled={!isEditable}
                value={issue.storyPoints ?? ''}
                onChange={(e) =>
                  updateIssue(issue.id, {
                    storyPoints: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
              >
                <option value="">None (Unestimated)</option>
                {[1, 2, 3, 5, 8, 13, 21].map((pts) => (
                  <option key={pts} value={pts}>
                    {pts} pt{pts === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-slate-500 font-medium mb-1.5 uppercase tracking-wider text-[11px]">
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {issue.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded"
                  >
                    #{label}
                    {isEditable && (
                      <button
                        onClick={() => handleRemoveLabel(label)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditable && (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add label..."
                    value={newLabelDraft}
                    onChange={(e) => setNewLabelDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/80 space-y-1 text-[11px] text-slate-400 font-mono">
              <div>Created: {new Date(issue.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(issue.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
