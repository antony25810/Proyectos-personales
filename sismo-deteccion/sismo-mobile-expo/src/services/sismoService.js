import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../config/api';

class SismoService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async getAllSismos() {
    try {
      const response = await this.api.get(API_ENDPOINTS.SISMOS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSismosByMagnitud(magnitud = 5) {
    try {
      const response = await this.api.get(`/api/sismos/magnitud/${magnitud}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.mensaje || 'Error al obtener sismos');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor.');
      } else {
        throw new Error(error.message);
      }
    }
  }


  async uploadCSV(fileUri) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'text/csv',
        name: 'sismos.csv'
      });

      const response = await this.api.post(API_ENDPOINTS.UPLOAD_CSV, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
      return { error: true, message: "Error de conexión con el servidor" };
    } else {
      return { error: true, message: "Error inesperado" };
    }
  }
}

export default new SismoService();