import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IssueDetailModal } from './IssueDetailModal';
import { CreateIssueModal } from './CreateIssueModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { NewProjectModal } from './NewProjectModal';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-mono">
          Authenticating session...
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
      <>
        <Outlet />

        {/* Global modals: mounted once so they work on every protected page */}
        <IssueDetailModal />
        <CreateIssueModal />
        <ProjectSettingsModal />
        <NewProjectModal />
      </>
  );
};