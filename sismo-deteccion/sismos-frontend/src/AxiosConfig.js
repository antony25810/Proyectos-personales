import axios from 'axios';
import API_URL from './config';

const axiosInstance = axios.create({
    baseURL: API_URL,  // URL del backend
    withCredentials: true,  // Permitir envío de cookies o credenciales
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para verificar y mantener la sesión
axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        console.log('Sesión perdida - Redirigiendo a login');
        // Si lo deseas, puedes redirigir al login
        // window.location = '/login';
      }
      return Promise.reject(error);
    }
);
  
// Función de utilidad para verificar la sesión
export const checkSession = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/check');
      return response.data.authenticated === true;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return false;
    }
};

export default axiosInstance;