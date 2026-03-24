import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import type { User } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: User['role'][];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
