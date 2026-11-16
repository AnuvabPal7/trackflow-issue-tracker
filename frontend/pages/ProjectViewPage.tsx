import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { WorkspaceToolbar } from '../components/WorkspaceToolbar';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { AgileDashboard } from '../components/AgileDashboard';

export const ProjectViewPage: React.FC<{ view: 'board' | 'list' | 'dashboard' }> = ({ view }) => {
    const { key } = useParams<{ key: string }>();
    const { currentProject, setCurrentProjectKey, projects, isLoading } = useApp();

    useEffect(() => {
        if (key && currentProject?.key !== key.toUpperCase()) {
            setCurrentProjectKey(key.toUpperCase());
        }
    }, [key, currentProject?.key, setCurrentProjectKey]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-mono">
                Loading project workspace...
            </div>
        );
    }

    // If projects exist and key is not found, fallback to first project or redirect
    if (projects.length > 0 && key && !projects.some((p) => p.key === key.toUpperCase())) {
        return <Navigate to={`/projects/${projects[0].key}/board`} replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            <WorkspaceToolbar />

            <main className="flex-1 flex flex-col">
                {view === 'board' && <KanbanBoard />}
                {view === 'list' && <ListView />}
                {view === 'dashboard' && <AgileDashboard />}
            </main>

        </div>
    );
};