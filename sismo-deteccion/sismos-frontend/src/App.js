import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SismosMap from './components/SismosMap';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Registro';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login y registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Mapa de sismos */}
        <Route path="/sismos" element={<SismosMap />} />

        {/* Gestión de usuarios y dashboard de administrador */}
        <Route path="/admin/gestion-usuarios" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Dashboard y perfil de usuario */}
        <Route path="/user/dashboard/*" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={<UserProfile />} />

        {/* Página de inicio */}
        <Route path="/home" element={<Home />} />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;