import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkSession } from '../AxiosConfig';

// Un componente de ruta protegida que verifica la sesión
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Asumir autenticado inicialmente
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const authenticated = await checkSession();
      setIsAuthenticated(authenticated);
      setChecking(false);
    };

    verifySession();
  }, []);

  if (checking) {
    return <div>Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;