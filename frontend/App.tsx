import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectViewPage } from './pages/ProjectViewPage';

export default function App() {
  return (
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:key/board" element={<ProjectViewPage view="board" />} />
              <Route path="/projects/:key/list" element={<ProjectViewPage view="list" />} />
              <Route path="/projects/:key/dashboard" element={<ProjectViewPage view="dashboard" />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
  );
}