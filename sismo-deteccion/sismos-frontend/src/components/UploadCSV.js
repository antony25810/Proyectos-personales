import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

// Iconos SVG consistentes con el resto de componentes
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
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

const IconSuccess = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const UploadCSV = ({ darkMode = false }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Manejar cambio de archivo
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage(""); // Limpiar mensajes previos
    }
  };

  // Manejar subida de archivo
  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor selecciona un archivo CSV.");
      setError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/sismos/cargar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Archivo subido exitosamente. Los datos han sido procesados.");
      setError(false);
      setFileName(""); // Limpiar nombre de archivo
      setFile(null); // Limpiar archivo
      // Restablecer el input file
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
      
      console.log(response); // Dejar el log para debug
    } catch (error) {
      setMessage(error.response?.data?.mensaje || "Error al cargar el archivo. Verifica el formato.");
      setError(true);
      console.error("Error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  // Estilos CSS integrados
  const styles = {
    container: {
      padding: '2rem',
      borderRadius: '0.5rem',
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    headerIcon: {
      padding: '0.75rem',
      borderRadius: '9999px',
      backgroundColor: darkMode ? '#3182ce' : '#3b82f6',
      marginRight: '1rem',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: darkMode ? '#90cdf4' : '#2563eb',
      margin: 0,
    },
    divider: {
      width: '4rem',
      height: '0.25rem',
      backgroundColor: darkMode ? '#3182ce' : '#60a5fa',
      marginTop: '0.5rem',
      borderRadius: '9999px',
      marginBottom: '1.5rem',
    },
    messageContainer: {
      marginBottom: '1.5rem',
      padding: '0.75rem',
      borderRadius: '0.25rem',
      display: error || message ? 'flex' : 'none',
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
      marginRight: '0.75rem',
    },
    fileInputContainer: {
      marginBottom: '1.5rem',
    },
    fileInputLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: darkMode ? '#d1d5db' : '#4b5563',
    },
    fileInputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    customFileInput: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    fileButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.625rem 1rem',
      borderRadius: '0.5rem',
      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
      color: darkMode ? '#e5e7eb' : '#1f2937',
      border: `1px solid ${darkMode ? '#6b7280' : '#d1d5db'}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      maxWidth: 'fit-content',
    },
    fileNameDisplay: {
      padding: '0.5rem',
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      color: darkMode ? '#d1d5db' : '#4b5563',
      borderRadius: '0.25rem',
      marginTop: '0.5rem',
      display: fileName ? 'block' : 'none',
      wordBreak: 'break-word',
    },
    uploadButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%', 
      maxWidth: '14rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      backgroundColor: loading 
        ? (darkMode ? '#1e40af' : '#93c5fd') 
        : (darkMode ? '#3b82f6' : '#2563eb'),
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'relative',
      overflow: 'hidden',
    },
    spinner: {
      animation: 'spin 1s linear infinite',
    },
    hiddenFileInput: {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      opacity: 0,
    },
    description: {
      fontSize: '0.875rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginTop: '1.5rem',
      padding: '0.75rem',
      borderRadius: '0.25rem',
      backgroundColor: darkMode ? '#374151' : '#f9fafb',
      border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
    }
  };

  // Estilo adicional para spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <IconUpload />
        </div>
        <h2 style={styles.title}>Subir CSV de Sismos</h2>
      </div>
      <div style={styles.divider}></div>
      
      {/* Mensaje de error o éxito */}
      {message && (
        <div style={styles.messageContainer}>
          <span style={styles.alertIcon}>
            {error ? <IconAlert /> : <IconSuccess />}
          </span>
          <span>{message}</span>
        </div>
      )}
      
      {/* Selector de archivo */}
      <div style={styles.fileInputContainer}>
        <label style={styles.fileInputLabel}>Selecciona un archivo CSV</label>
        <div style={styles.fileInputWrapper}>
          <div style={styles.customFileInput}>
            <label htmlFor="csv-file-input" style={styles.fileButton}>
              <IconFile />
              Seleccionar archivo
            </label>
            {fileName && (
              <div style={styles.fileNameDisplay}>
                {fileName}
              </div>
            )}
            <input 
              type="file" 
              id="csv-file-input"
              accept=".csv" 
              onChange={handleFileChange}
              style={styles.hiddenFileInput}
            />
          </div>
          
          <button 
            onClick={handleUpload} 
            disabled={loading || !file}
            style={{
              ...styles.uploadButton,
              opacity: loading || !file ? 0.7 : 1,
              cursor: loading || !file ? 'not-allowed' : 'pointer'
            }}
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
                <IconUpload />
                Subir archivo
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Información adicional */}
      <div style={styles.description}>
        <p>Formato esperado: archivo CSV con columnas de fecha, hora, magnitud, profundidad, latitud y longitud.</p>
        <p style={{marginTop: '0.5rem'}}>Los datos serán procesados y añadidos a la base de datos de sismos.</p>
      </div>
    </div>
  );
};

export default UploadCSV;