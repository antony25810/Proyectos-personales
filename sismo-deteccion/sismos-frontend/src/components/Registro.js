import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

// Iconos SVG básicos, consistentes con Login.jsx
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

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nombre,
        email,
        password,
        confirmPassword
      };
      
      const response = await axios.post(`${API_URL}/api/registro`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.data && !response.data.error) {
        setMensaje(response.data.mensaje || 'Registro exitoso. Redirigiendo al login...');
        setError(false);
        
        // Redirigir al login después de un breve retraso
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMensaje(response.data.mensaje || 'Error en el registro');
        setError(true);
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setMensaje('El nombre de usuario o email ya está en uso');
        } else {
          setMensaje(error.response.data?.mensaje || 'Error al procesar el registro');
        }
      } else if (error.request) {
        setMensaje('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        setMensaje(`Error: ${error.message}`);
      }
      
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Estilos CSS integrados consistentes con Login.jsx
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
          <h2 style={styles.subtitle}>Crear Cuenta</h2>
          <div style={styles.divider}></div>
        </div>
        
        {/* Mensaje de error o éxito */}
        {mensaje && (
          <div style={styles.messageContainer}>
            {error && <span style={styles.alertIcon}><IconAlert /></span>}
            <span>{mensaje}</span>
          </div>
        )}
        
        {/* Formulario de registro */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="nombre" style={styles.label}>
              Nombre de Usuario
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <IconUser />
              </span>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingrese su nombre de usuario"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Correo Electrónico
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <IconMail />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Ingrese su correo electrónico"
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

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmar Contraseña
            </label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <IconLock />
              </span>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Confirme su contraseña"
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
                Procesando...
              </>
            ) : (
              <>
                <span style={styles.buttonIcon}><IconUserPlus /></span>
                Crear Cuenta
              </>
            )}
          </button>
        </form>
        
        {/* Enlace para ir al login */}
        <div style={styles.footer}>
          ¿Ya tienes una cuenta? <a href="/login" style={styles.link}>Inicia sesión aquí</a>
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

export default Register;