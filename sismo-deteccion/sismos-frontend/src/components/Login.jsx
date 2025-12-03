import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

// Si tienes problemas con las importaciones de Lucide, puedes usar estos SVGs básicos
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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

const IconActivity = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconLogIn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Estado para tema oscuro con persistencia
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Guardar preferencia de tema
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    // Cambiamos también en el elemento HTML para aplicar globalmente
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    
    const loginUrl = `${API_URL}/api/auth/login`;
    console.log('Intentando login en:', loginUrl);
    
    try {
      const userData = {
        username: username,
        password: password
      };
      
      const response = await axios.post(loginUrl, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
      
      console.log('Respuesta recibida:', response);
      
      if (response.data && !response.data.error) {
        setMensaje(response.data.message || 'Login exitoso');
        setError(false);
        
        // Guardar info de usuario
        localStorage.setItem('username', response.data.username);
        
        // Si la respuesta ya incluye el rol, guardarlo directamente
        if (response.data.roles && response.data.roles.length > 0) {
          localStorage.setItem('userRole', response.data.roles[0]);
          
          // Redirigir basado en rol
          setTimeout(() => {
            const role = response.data.roles[0];
            if (role === 'ROLE_ADMIN') {
              navigate('/admin/dashboard');
            } else {
              navigate('/user/dashboard/tabla');
            }
          }, 1000);
        } else {
          // Verificar roles después del login
          try {
            const authCheckResponse = await axios.get(`${API_URL}/api/auth/check`, {
              withCredentials: true,
              headers: { 'Accept': 'application/json' }
            });
            
            if (authCheckResponse.data.authenticated) {
              if (authCheckResponse.data.roles && authCheckResponse.data.roles.length > 0) {
                localStorage.setItem('userRole', authCheckResponse.data.roles[0]);
                
                // Redirigir basado en rol
                const role = authCheckResponse.data.roles[0];
                if (role === 'ROLE_ADMIN') {
                  setTimeout(() => navigate('/admin/dashboard'), 1000);
                } else {
                  setTimeout(() => navigate('/user/dashboard/tabla'), 1000);
                }
              } else {
                localStorage.setItem('userRole', 'ROLE_USER');
                setTimeout(() => navigate('/user/dashboard/tabla'), 1000);
              }
            } else {
              fallbackGetRole();
            }
          } catch (error) {
            console.error('Error al verificar autenticación:', error);
            fallbackGetRole();
          }
        }
      } else {
        setMensaje(response.data.message || 'Credenciales inválidas');
        setError(true);
      }
    } catch (error) {
      console.error('Error en la petición de login:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setMensaje('Error: La URL de login no existe. Verifique la configuración del servidor.');
        } else if (error.response.status === 401 || error.response.status === 403) {
          setMensaje('Usuario o contraseña incorrectos');
        } else {
          setMensaje(`Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`);
        }
      } else if (error.request) {
        setMensaje('No se pudo conectar con el servidor. Verifique su conexión y que el servidor esté activo.');
      } else {
        setMensaje(`Error: ${error.message}`);
      }
      
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Función de respaldo para obtener el rol
  const fallbackGetRole = async () => {
    try {
      const roleResponse = await axios.get(`${API_URL}/api/home`, {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      });
      
      if (roleResponse.data.isAdmin) {
        localStorage.setItem('userRole', 'ROLE_ADMIN');
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      } else {
        localStorage.setItem('userRole', 'ROLE_USER');
        setTimeout(() => navigate('/user/dashboard/tabla'), 1000);
      }
    } catch (error) {
      console.error('Error al obtener el rol (respaldo):', error);
      localStorage.setItem('userRole', 'ROLE_USER');
      setTimeout(() => navigate('/user/dashboard/tabla'), 1000);
    }
  };

  // Estilos CSS integrados para evitar dependencia de Tailwind
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      backgroundColor: darkMode ? '#1a202c' : '#f3f4f6',
      color: darkMode ? '#fff' : '#1f2937',
      transition: 'background-color 0.3s, color 0.3s',
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
    },
    formContainer: {
      width: '100%',
      maxWidth: '28rem',
      padding: '2rem',
      borderRadius: '0.5rem',
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'relative',
      zIndex: 10,
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
    },
    logo: {
      padding: '1rem',
      borderRadius: '9999px',
      backgroundColor: darkMode ? '#3182ce' : '#3b82f6',
      marginBottom: '0.75rem',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: darkMode ? '#90cdf4' : '#2563eb',
      margin: 0,
    },
    subtitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginTop: '0.5rem',
      color: darkMode ? '#fff' : '#1f2937',
    },
    divider: {
      width: '4rem',
      height: '0.25rem',
      backgroundColor: darkMode ? '#3182ce' : '#60a5fa',
      marginTop: '0.5rem',
      borderRadius: '9999px',
    },
    messageContainer: {
      marginBottom: '1rem',
      padding: '0.75rem',
      borderRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: error 
        ? (darkMode ? 'rgba(254, 202, 202, 0.2)' : '#fee2e2') 
        : (darkMode ? 'rgba(209, 250, 229, 0.2)' : '#d1fae5'),
      color: error ? '#b91c1c' : '#047857',
      border: `1px solid ${error 
        ? (darkMode ? 'rgba(254, 202, 202, 0.3)' : '#fecaca') 
        : (darkMode ? 'rgba(167, 243, 208, 0.3)' : '#a7f3d0')}`,
    },
    alertIcon: {
      marginRight: '0.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: darkMode ? '#d1d5db' : '#4b5563',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: darkMode ? '#9ca3af' : '#6b7280',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '0.75rem',
      paddingTop: '0.625rem',
      paddingBottom: '0.625rem',
      borderRadius: '0.5rem',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: darkMode ? '#4b5563' : '#f9fafb',
      color: darkMode ? '#fff' : '#1f2937',
      border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
    },
    button: {
      width: '100%',
      paddingTop: '0.625rem',
      paddingBottom: '0.625rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      backgroundColor: loading 
        ? (darkMode ? '#1e40af' : '#93c5fd') 
        : (darkMode ? '#3b82f6' : '#2563eb'),
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    buttonIcon: {
      marginRight: '0.5rem',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem',
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
    },
    link: {
      fontWeight: '500',
      color: darkMode ? '#60a5fa' : '#2563eb',
      textDecoration: 'none',
    },
    infoFooter: {
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
      textAlign: 'center',
      fontSize: '0.75rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    // Estilos para las ondas sísmicas
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
      border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
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
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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
      
      button:focus, input:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      input::placeholder {
        color: ${darkMode ? '#9ca3af' : '#a0aec0'};
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [darkMode]);

  return (
    <div style={styles.container}>
      {/* Ondas sísmicas animadas (background) */}
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

      {/* Botón para alternar modo oscuro */}
      <button
        onClick={toggleDarkMode}
        style={styles.themeToggle}
        aria-label="Cambiar tema"
      >
        {darkMode ? <IconSun /> : <IconMoon />}
      </button>

      <div style={styles.formContainer}>
        {/* Logo y título */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <IconActivity />
          </div>
          <h1 style={styles.title}>SismoMonitor</h1>
          <h2 style={styles.subtitle}>Iniciar Sesión</h2>
          <div style={styles.divider}></div>
        </div>
        
        {/* Mensaje de error o éxito */}
        {mensaje && (
          <div style={styles.messageContainer}>
            {error && <span style={styles.alertIcon}><IconAlert /></span>}
            <span>{mensaje}</span>
          </div>
        )}
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Usuario
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <IconUser />
              </span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingrese su nombre de usuario"
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Contraseña
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <IconLock />
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingrese su contraseña"
                style={styles.input}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <>
                <svg style={styles.spinner} width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="8" />
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                <span style={styles.buttonIcon}><IconLogIn /></span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
        
        {/* Enlace de registro */}
        <div style={styles.footer}>
          ¿No tienes una cuenta? <a href="/register" style={styles.link}>Regístrate aquí</a>
        </div>
        
        {/* Pie de página con información del sistema */}
        <div style={styles.infoFooter}>
          <p>Sistema de Monitoreo Sísmico</p>
          <p style={{marginTop: '0.25rem'}}>Visualización y alerta de actividad sísmica en tiempo real</p>
        </div>
      </div>
    </div>
  );
};

export default Login;