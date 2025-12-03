export const BASE_URL = "http://10.100.82.194:8080";

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: "/api/auth/login",
  CHECK_AUTH: "/api/auth/check",
  
  // Sismos
  SISMOS: "/api/sismos",
  SISMOS_BY_MAGNITUDE: "/api/sismos/magnitud",
  UPLOAD_CSV: "/api/sismos/cargar",
  STATE: "/api/sismos/cargar/cargar/estado/{timestamp}",
  PROPAGACION: "/api/propagation",

  // Grafos
  GRAFOS: "/api/grafos",
  GRAFO_SISMOS: "/api/grafos/sismos",
  GRAFO_UBI: "/api/grafos/ubicaciones",
  CARGAR_GRAFOS: "/api/grafos/cargar-existentes",
  VER_GRAFOS: "/api/grafos/visualizacion",
  
  // Otros endpoints que podrías tener
  REGISTER: "/api/registro",
  HOME: "/api/home",
  ADMIN: "/api/admin/usuarios"
};