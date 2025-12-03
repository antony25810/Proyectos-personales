import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Interceptor para debug
    this.api.interceptors.request.use(
      (config) => {
        console.log('🚀 Making request to:', config.baseURL + config.url);
        console.log('📦 Request data:', config.data);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Response received:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.data);
        console.error('❌ Full error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    try {
      console.log('🔐 Attempting login with:', username);
      const response = await this.api.post(API_ENDPOINTS.LOGIN, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Registro de usuario
  async register({ nombre, email, password, confirmPassword }) {
    try {
      const response = await this.api.post('/api/registro', {
        nombre,
        email,
        password,
        confirmPassword,
      });
      // Espera que el backend devuelva {mensaje, error}
      return response.data;
    } catch (error) {
      if (error.response) {
        // Error del backend (por ejemplo, 400, 409)
        return {
          error: true,
          mensaje: error.response.data?.mensaje || 'Error al procesar el registro',
        };
      } else if (error.request) {
        // No hay respuesta del backend
        return {
          error: true,
          mensaje: 'No se pudo conectar con el servidor. Verifique su conexión.',
        };
      } else {
        return {
          error: true,
          mensaje: error.message,
        };
      }
    }
  }


  async testConnection() {
    try {
      console.log('🔄 Testing connection to:', BASE_URL);
      const response = await this.api.get('/api/sismos');
      console.log('✅ Connection test successful');
      return response.data;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // El servidor respondió con un error
      console.error('Server error response:', error.response.data);
      return {
        error: true,
        message: error.response.data.message || 'Error del servidor',
        status: error.response.status
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No response received:', error.request);
      return {
        error: true,
        message: "No se pudo conectar con el servidor. Verifica tu conexión de red.",
        type: 'network'
      };
    } else {
      // Error en la configuración de la petición
      console.error('Request setup error:', error.message);
      return {
        error: true,
        message: "Error de configuración: " + error.message,
        type: 'config'
      };
    }
  }
}

export default new AuthService();