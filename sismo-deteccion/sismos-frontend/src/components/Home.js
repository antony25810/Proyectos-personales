import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); // Obtener el rol del usuario (ROLE_ADMIN o ROLE_USER)

  

  useEffect(() => {
    if (userRole === 'ROLE_ADMIN') {
      navigate('/admin/dashboard'); // Redirigir al dashboard del administrador
    } else if (userRole === 'ROLE_USER') {
      navigate('/user/dashboard'); // Redirigir al dashboard del usuario
    } else {
      navigate('/login'); // Si no tiene un rol válido, redirigir al login
    }
  }, [userRole, navigate]);

  // Mostrar un mensaje de carga mientras se redirige
  return <div>Cargando...</div>;
};

export default Home;