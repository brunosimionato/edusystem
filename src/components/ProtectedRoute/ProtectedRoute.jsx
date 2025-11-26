export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, userRole, isLoading } = useAuth();
  
    if (isLoading) return <div>Carregando...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Backend usa: 'professor', 'secretaria', 'aluno'
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  
    return children;
  }