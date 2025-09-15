import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import MemberDashboard from './components/member/MemberDashboard';
import TreasurerDashboard from './components/treasurer/TreasurerDashboard';
import PastorDashboard from './components/pastor/PastorDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ 
  children, 
  roles = [] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'member':
      return <MemberDashboard />;
    case 'treasurer':
      return <TreasurerDashboard />;
    case 'pastor':
      return <PastorDashboard />;
    default:
      return <div>Tipo de usuário não reconhecido</div>;
  }
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Acesso Negado
                  </h1>
                  <p className="text-gray-600">
                    Você não tem permissão para acessar esta página.
                  </p>
                </div>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
