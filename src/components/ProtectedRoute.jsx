import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { authUser, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!authUser) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(authUser.role)) {
    return <div className="unauthorized"><h2>Access Denied</h2><p>You don't have permission to access this page.</p></div>;
  }

  return children;
};

export default ProtectedRoute;
