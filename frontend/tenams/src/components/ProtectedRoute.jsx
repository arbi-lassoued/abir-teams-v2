import { useAuth } from '../context/UseAuth';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle spécifique est requis, vérifier que l'utilisateur l'a
  if (requiredRole) {
    const userRoles = user.roles ? 
      (typeof user.roles === 'string' ? user.roles.split(',').map(r => r.trim()) : user.roles) 
      : [];
    if (!userRoles.includes(requiredRole)) {
      // Redirect non-authorized users to Engineering Tools
      return <Navigate to="/project_management" replace />;
    }
  }

  return children;
}