import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SismosTable from './SismosTable';
import SismosMap from './SismosMap';
import GrafoVisualizacion from './GrafoVisualizacion';
import UploadCSV from './UploadCSV';
import UserManagement from './UserManagement';

// Iconos SVG consistentes con los otros componentes
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const IconTable = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

const IconMap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const IconGraph = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const IconActivity = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para tema oscuro con persistencia
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Guardar preferencia de tema
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };
  
  // Determinar la página activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Estilos CSS integrados consistentes con Registro.js
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: darkMode ? '#1a202c' : '#f3f4f6',
      color: darkMode ? '#fff' : '#1f2937',
      transition: 'background-color 0.3s, color 0.3s',
      position: 'relative',
    },
    themeToggle: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.5rem',
      borderRadius: '9999px',
      background: darkMode ? '#374151' : '#fff',
      color: darkMode ? '#e5e7eb' : '#1f2937',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      zIndex: 20,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      position: 'relative',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    logo: {
      padding: '0.75rem',
      borderRadius: '9999px',
      backgroundColor: darkMode ? '#9f580a' : '#d97706', // Color naranja para diferenciarlo del usuario normal
      marginRight: '0.75rem',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shield: {
      padding: '0.25rem',
      borderRadius: '9999px',
      backgroundColor: darkMode ? '#9f580a' : '#d97706',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: darkMode ? '#fbd38d' : '#d97706', // Color naranja para admin
      margin: 0,
    },
    subtitle: {
      fontSize: '1rem',
      color: darkMode ? '#e5e7eb' : '#6b7280',
      margin: 0,
      marginLeft: '0.5rem',
      display: 'flex',
      alignItems: 'center',
    },
    logoutButton: {
      position: 'absolute',
      right: '4rem',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      backgroundColor: darkMode ? '#9B2C2C' : '#e53e3e',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    logoutIcon: {
      marginRight: '0.5rem',
    },
    content: {
      flex: 1,
      display: 'flex',
      position: 'relative',
    },
    navigation: {
      width: '250px',
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      borderRight: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
      padding: '1.5rem 1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    navItem: {
      borderRadius: '0.5rem',
      overflow: 'hidden',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      color: darkMode ? '#e5e7eb' : '#4b5563',
      textDecoration: 'none',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
    },
    navLinkActive: {
      backgroundColor: darkMode ? '#9f580a' : '#d97706', // Color naranja para admin
      color: '#fff',
    },
    navIcon: {
      marginRight: '0.75rem',
    },
    adminSection: {
      marginTop: '1.5rem',
      borderTop: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
      paddingTop: '1rem',
    },
    adminSectionTitle: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '0.75rem',
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      overflow: 'auto',
      backgroundColor: darkMode ? '#1a202c' : '#f9fafb',
    },
    componentContainer: {
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      padding: '2rem',
      minHeight: 'calc(100vh - 12rem)',
    },
    wavesContainer: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    },
    wave: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      border: `1px solid ${darkMode ? 'rgba(217, 119, 6, 0.3)' : 'rgba(217, 119, 6, 0.2)'}`, // Naranja para admin
    },
    footer: {
      padding: '1rem',
      textAlign: 'center',
      borderTop: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      color: darkMode ? '#9ca3af' : '#6b7280',
      fontSize: '0.875rem',
    },
  };

  // Estilo global (se añadirá al head del documento una vez)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
      }
      
      @keyframes ping {
        75%, 100% {
          transform: translate(-50%, -50%) scale(2);
          opacity: 0;
        }
      }
      
      .dark-mode {
        background-color: #1a202c;
        color: #fff;
      }
      
      button:focus {
        outline: 2px solid #d97706;
        outline-offset: 2px;
      }
      
      .wave-animation {
        animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [darkMode]);

  return (
    <div style={styles.container}>
      {/* Ondas sísmicas animadas (background) con color naranja para admin */}
      <div style={styles.wavesContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              ...styles.wave,
              width: `${i * 10}%`,
              height: `${i * 10}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '3s',
            }}
            className="wave-animation"
          />
        ))}
      </div>

      {/* Cabecera */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <IconActivity />
          </div>
          <h1 style={styles.title}>SismoMonitor</h1>
          <p style={styles.subtitle}>
            <span style={styles.shield}><IconShield /></span>
            Panel de Administrador
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          aria-label="Cerrar sesión"
        >
          <span style={styles.logoutIcon}><IconLogout /></span>
          Cerrar sesión
        </button>
        
        {/* Botón para alternar modo oscuro */}
        <button
          onClick={toggleDarkMode}
          style={styles.themeToggle}
          aria-label="Cambiar tema"
        >
          {darkMode ? <IconSun /> : <IconMoon />}
        </button>
      </header>
      
      <div style={styles.content}>
        {/* Navegación lateral */}
        <nav style={styles.navigation}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <Link 
                to="/admin/dashboard/tabla"
                style={{
                  ...styles.navLink,
                  ...(isActive('/admin/dashboard/tabla') ? styles.navLinkActive : {})
                }}
              >
                <span style={styles.navIcon}><IconTable /></span>
                Tabla de Sismos
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link 
                to="/admin/dashboard/mapa"
                style={{
                  ...styles.navLink,
                  ...(isActive('/admin/dashboard/mapa') ? styles.navLinkActive : {})
                }}
              >
                <span style={styles.navIcon}><IconMap /></span>
                Mapa de Sismos
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link 
                to="/admin/dashboard/grafo"
                style={{
                  ...styles.navLink,
                  ...(isActive('/admin/dashboard/grafo') ? styles.navLinkActive : {})
                }}
              >
                <span style={styles.navIcon}><IconGraph /></span>
                Grafo de Conocimiento
              </Link>
            </li>
            
            {/* Sección de administración */}
            <div style={styles.adminSection}>
              <h3 style={styles.adminSectionTitle}>Administración</h3>
              <li style={styles.navItem}>
                <Link 
                  to="/admin/dashboard/csv"
                  style={{
                    ...styles.navLink,
                    ...(isActive('/admin/dashboard/csv') ? styles.navLinkActive : {})
                  }}
                >
                  <span style={styles.navIcon}><IconUpload /></span>
                  Cargar CSV
                </Link>
              </li>
              <li style={styles.navItem}>
                <Link 
                  to="/admin/dashboard/usuarios"
                  style={{
                    ...styles.navLink,
                    ...(isActive('/admin/dashboard/usuarios') ? styles.navLinkActive : {})
                  }}
                >
                  <span style={styles.navIcon}><IconUsers /></span>
                  Gestión de Usuarios
                </Link>
              </li>
            </div>
          </ul>
        </nav>
        
        {/* Contenido principal */}
        <main style={styles.mainContent}>
          <div style={styles.componentContainer}>
            <Routes>
              <Route path="tabla" element={<SismosTable darkMode={darkMode} />} />
              <Route path="mapa" element={<SismosMap darkMode={darkMode} />} />
              <Route path="grafo" element={<GrafoVisualizacion darkMode={darkMode} />} />
              <Route path="csv" element={<UploadCSV darkMode={darkMode} />} />
              <Route path="usuarios" element={<UserManagement darkMode={darkMode} />} />
            </Routes>
          </div>
        </main>
      </div>
      
      {/* Pie de página */}
      <footer style={styles.footer}>
        <p>Sistema de Monitoreo Sísmico</p>
        <p style={{marginTop: '0.25rem'}}>Visualización y alerta de actividad sísmica en tiempo real</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;