import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import UsersPage from '../pages/UsersPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import ProjectsPage from '../pages/ProjectsPage';
import DatasetsPage from '../pages/DatasetsPage';
import TasksPage from '../pages/TasksPage';
import DashboardPage from '../pages/DashboardPage';
import ExportPage from '../pages/ExportPage';
import MyTasksPage from '../pages/MyTasksPage';
import AnnotationPage from '../pages/AnnotationPage';
import ReviewPage from '../pages/ReviewPage';

const withLayout = (element: React.ReactNode) => (
  <MainLayout>{element}</MainLayout>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Tất cả roles */}
      <Route path="/" element={<ProtectedRoute>{withLayout(<HomePage />)}</ProtectedRoute>} />

      {/* ADMIN only */}
      <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}>{withLayout(<UsersPage />)}</ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute roles={['ADMIN']}>{withLayout(<AuditLogsPage />)}</ProtectedRoute>} />

      {/* MANAGER only */}
      <Route path="/projects" element={<ProtectedRoute roles={['MANAGER']}>{withLayout(<ProjectsPage />)}</ProtectedRoute>} />
      <Route path="/datasets" element={<ProtectedRoute roles={['MANAGER']}>{withLayout(<DatasetsPage />)}</ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute roles={['MANAGER']}>{withLayout(<TasksPage />)}</ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute roles={['MANAGER']}>{withLayout(<DashboardPage />)}</ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute roles={['MANAGER']}>{withLayout(<ExportPage />)}</ProtectedRoute>} />

      {/* ANNOTATOR only */}
      <Route path="/my-tasks" element={<ProtectedRoute roles={['ANNOTATOR']}>{withLayout(<MyTasksPage />)}</ProtectedRoute>} />
      <Route path="/annotation" element={<ProtectedRoute roles={['ANNOTATOR']}>{withLayout(<AnnotationPage />)}</ProtectedRoute>} />

      {/* REVIEWER only */}
      <Route path="/review" element={<ProtectedRoute roles={['REVIEWER']}>{withLayout(<ReviewPage />)}</ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;