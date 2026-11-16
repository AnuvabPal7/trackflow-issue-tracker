import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { FolderKanban, Plus, Trash2, ArrowRight, Shield, Users, Layers } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    currentUser,
    canDeleteProject,
    deleteProject,
    setIsNewProjectOpen,
    issues,
    users,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDeleteProject()) {
      showToast('Only administrators can delete projects.', 'error');
      return;
    }
    await deleteProject(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select an engineering workspace or create a new microservice board
            </p>
          </div>

          {canDeleteProject() && (
            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6 max-w-sm">
          <input
            type="text"
            placeholder="Search projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectIssues = issues.filter((i) => i.projectId === project.id);
            const openIssues = projectIssues.filter((i) => i.status !== 'DONE').length;
            const lead = users.find((u) => u.id === project.leadId);

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.key}/board`)}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                        {project.key.slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {project.name}
                        </h2>
                        <span className="font-mono text-[11px] text-slate-400">
                          Key: {project.key}
                        </span>
                      </div>
                    </div>

                    {canDeleteProject() && (
                      <button
                        onClick={(e) => handleDelete(project.id, project.name, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-opacity cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{openIssues} open tickets</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.members.length} members</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
