import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, FolderPlus, Shield } from 'lucide-react';

export const NewProjectModal: React.FC = () => {
  const {
    isNewProjectOpen,
    setIsNewProjectOpen,
    createProject,
    currentUser,
    canDeleteProject,
  } = useApp();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  if (!isNewProjectOpen) return null;

  const isAdmin = canDeleteProject();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      // Suggest project key automatically
      const generated = val
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      setKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    await createProject(name, key, description);
    setIsNewProjectOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Create New Project</h2>
          </div>
          <button
            onClick={() => setIsNewProjectOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAdmin ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Permission Required</span>
              </div>
              <p>
                Project creation is restricted to users with <code className="font-mono">ROLE_ADMIN</code>. Your active role is <strong className="font-mono">{currentUser?.role || 'ANONYMOUS'}</strong>.
              </p>
            </div>
            <p className="text-slate-600">
              Please sign in with an Administrator account (such as Sarah Connor) to register new microservice projects.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewProjectOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Identity & Access Gateway"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                Project Key <span className="text-rose-500">*</span> (prefix for all ticket IDs)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. AUTH, BILL, CORE"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tickets will be assigned keys like: <span className="font-mono">{key || 'PROJ'}-101</span>
              </p>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 uppercase tracking-wider text-[11px]">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="What is the scope and mission of this project service?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewProjectOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Create Project
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
