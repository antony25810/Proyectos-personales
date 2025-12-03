import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import API_URL from "../config";

// Velocidades de ondas sísmicas (km/s)
const P_WAVE_VELOCITY = 6.0;  
const S_WAVE_VELOCITY = 3.5;  
const SURFACE_WAVE_VELOCITY = 2.5;

// Componente para actualizar la vista del mapa
function SetViewOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const SismoPropagation = ({ sismo }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(180); // 3 minutos por defecto
  const [interval, setInterval] = useState(5); // 5 segundos por intervalo
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef(null);

  // Función para generar estaciones virtuales
  const generateStations = (lat, lon, count) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 400; // Entre 100 y 500km
      const latOffset = (distance / 111) * Math.cos(angle);
      const lonOffset = (distance / (111 * Math.cos(Math.PI * lat / 180))) * Math.sin(angle);
      
      const stationLat = lat + latOffset;
      const stationLon = lon + lonOffset;
      
      // Calcular distancia
      const dist = calculateDistance(lat, lon, stationLat, stationLon);
      
      result.push({
        id: i + 1,
        name: `Estación ${i + 1}`,
        latitude: stationLat,
        longitude: stationLon,
        distance: dist,
        arrivalTimes: {
          pWave: dist / P_WAVE_VELOCITY,
          sWave: dist / S_WAVE_VELOCITY,
          surfaceWave: dist / SURFACE_WAVE_VELOCITY
        }
      });
    }
    return result;
  };

  // Efecto para generar estaciones cuando cambia el sismo
  useEffect(() => {
    if (sismo) {
      setLoading(true);
      // Generar estaciones directamente en el cliente
      const newStations = generateStations(sismo.latitud, sismo.longitud, 5);
      setStations(newStations);
      setCurrentTime(0);
      setLoading(false);
    }
  }, [sismo]);

  // Controlar la animación de tiempo
  useEffect(() => {
    if (isPlaying && sismo) {
      animationRef.current = setInterval(() => {
        setCurrentTime(prevTime => {
          const nextTime = prevTime + interval;
          return nextTime <= duration ? nextTime : 0; // Reiniciar al llegar al final
        });
      }, 1000);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, interval, duration, sismo]);

  // Calcular los radios de propagación de ondas en el momento actual
  const pWaveRadius = P_WAVE_VELOCITY * currentTime;
  const sWaveRadius = S_WAVE_VELOCITY * currentTime;
  const surfaceWaveRadius = SURFACE_WAVE_VELOCITY * currentTime;

  // Si no hay sismo seleccionado, mostrar mensaje
  if (!sismo) {
    return <div>Selecciona un sismo para visualizar la propagación de ondas sísmicas.</div>;
  }

  // Si está cargando, mostrar mensaje
  if (loading) {
    return <div>Preparando visualización de propagación...</div>;
  }

  // Obtener icono para estaciones según si las ondas han llegado o no
  const getStationIcon = (arrived) => {
    const color = arrived ? 'red' : 'blue';
    try {
      return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    } catch (e) {
      // Si hay un error con el icono personalizado, usar un marcador por defecto
      return new L.Icon.Default();
    }
  };

  return (
    <div style={{ padding: "15px", backgroundColor: "#f7f7f7", borderRadius: "8px" }}>
      <h2>Propagación de Ondas Sísmicas</h2>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "15px 0" }}>
        <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
          <span style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "6px", borderRadius: "50%", backgroundColor: 'blue' }}></span>
          <span>Ondas P (Primarias): {pWaveRadius.toFixed(0)} km</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
          <span style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "6px", borderRadius: "50%", backgroundColor: 'green' }}></span>
          <span>Ondas S (Secundarias): {sWaveRadius.toFixed(0)} km</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginRight: "15px" }}>
          <span style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "6px", borderRadius: "50%", backgroundColor: 'red' }}></span>
          <span>Ondas Superficiales: {surfaceWaveRadius.toFixed(0)} km</span>
        </div>
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              padding: "6px 12px", 
              backgroundColor: "#4285f4", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }}
          >
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(parseInt(e.target.value))}
            disabled={isPlaying}
            style={{ flex: 1, margin: "0 10px" }}
          />
          <span>{currentTime}s</span>
        </div>
        
        <div style={{ display: "flex", gap: "15px" }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            Duración (s):
            <input
              type="number"
              value={duration}
              min="30"
              max="600"
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={isPlaying}
              style={{ width: "60px", marginLeft: "8px", padding: "4px" }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center" }}>
            Intervalo (s):
            <input
              type="number"
              value={interval}
              min="1"
              max="30"
              onChange={(e) => setInterval(parseInt(e.target.value))}
              disabled={isPlaying}
              style={{ width: "60px", marginLeft: "8px", padding: "4px" }}
            />
          </label>
        </div>
      </div>
      
      <MapContainer 
        center={[sismo.latitud, sismo.longitud]} 
        zoom={5} 
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <SetViewOnChange center={[sismo.latitud, sismo.longitud]} />
        
        {/* Epicentro del sismo */}
        <CircleMarker
          center={[sismo.latitud, sismo.longitud]}
          pathOptions={{ 
            fillColor: getMagnitudeColor(sismo.magnitud),
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
          }}
          radius={sismo.magnitud ? Math.min(sismo.magnitud * 2, 12) : 6}
        >
          <Popup>
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>Sismo {sismo.magnitud || "No calculable"}</h3>
              <p style={{ margin: "5px 0" }}><strong>Fecha:</strong> {sismo.fecha}</p>
              <p style={{ margin: "5px 0" }}><strong>Hora:</strong> {sismo.hora}</p>
              <p style={{ margin: "5px 0" }}><strong>Profundidad:</strong> {sismo.profundidad} km</p>
              <p style={{ margin: "5px 0" }}><strong>Ubicación:</strong> {sismo.referenciaLocalizacion}</p>
              <p style={{ margin: "5px 0" }}><strong>Coordenadas:</strong> {sismo.latitud}, {sismo.longitud}</p>
            </div>
          </Popup>
        </CircleMarker>
        
        {/* Círculos de propagación de ondas P */}
        <Circle
          center={[sismo.latitud, sismo.longitud]}
          radius={pWaveRadius * 1000} // Convertir km a metros
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        >
          <Popup>Ondas P: {pWaveRadius.toFixed(0)} km</Popup>
        </Circle>
        
        {/* Círculos de propagación de ondas S */}
        <Circle
          center={[sismo.latitud, sismo.longitud]}
          radius={sWaveRadius * 1000} // Convertir km a metros
          pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
        >
          <Popup>Ondas S: {sWaveRadius.toFixed(0)} km</Popup>
        </Circle>
        
        {/* Círculos de propagación de ondas superficiales */}
        <Circle
          center={[sismo.latitud, sismo.longitud]}
          radius={surfaceWaveRadius * 1000} // Convertir km a metros
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
        >
          <Popup>Ondas Superficiales: {surfaceWaveRadius.toFixed(0)} km</Popup>
        </Circle>
        
        {/* Estaciones sísmicas virtuales */}
        {stations.map(station => {
          // Determinar si las ondas ya han alcanzado la estación
          const pWaveArrived = pWaveRadius >= station.distance;
          const sWaveArrived = sWaveRadius >= station.distance;
          const surfaceWaveArrived = surfaceWaveRadius >= station.distance;
          
          const icon = getStationIcon(pWaveArrived || sWaveArrived || surfaceWaveArrived);
          
          return (
            <Marker 
              key={station.id} 
              position={[station.latitude, station.longitude]}
              icon={icon}
            >
              <Popup>
                <div>
                  <strong>{station.name}</strong>
                  <p>Distancia al epicentro: {station.distance.toFixed(1)} km</p>
                  <p>Tiempo de llegada ondas P: {station.arrivalTimes.pWave.toFixed(1)} s
                    {pWaveArrived ? ' (✓)' : ''}
                  </p>
                  <p>Tiempo de llegada ondas S: {station.arrivalTimes.sWave.toFixed(1)} s
                    {sWaveArrived ? ' (✓)' : ''}
                  </p>
                  <p>Tiempo de llegada ondas superficiales: {station.arrivalTimes.surfaceWave.toFixed(1)} s
                    {surfaceWaveArrived ? ' (✓)' : ''}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "white" }}>
        <h3>Detalles del Sismo</h3>
        <p><strong>Magnitud:</strong> {sismo.magnitud || 'No calculable'}</p>
        <p><strong>Fecha:</strong> {sismo.fecha}</p>
        <p><strong>Hora:</strong> {sismo.hora}</p>
        <p><strong>Profundidad:</strong> {sismo.profundidad} km</p>
        <p><strong>Ubicación:</strong> {sismo.referenciaLocalizacion}</p>
        <p><strong>Tiempo transcurrido:</strong> {currentTime} segundos</p>
      </div>
      
      <div style={{ marginTop: "15px" }}>
        <h3>Estaciones Sísmicas</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {stations.map(station => (
            <div key={station.id} style={{ padding: "8px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
              <strong>{station.name}</strong>
              <p>Distancia: {station.distance.toFixed(1)} km</p>
              <p>Coordenadas: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Función para determinar el color según la magnitud
function getMagnitudeColor(magnitud) {
  if (!magnitud) return "#3388ff"; // Azul para No calculable
  
  if (magnitud >= 7) return "#ff0000"; // Rojo
  if (magnitud >= 6) return "#ff8800"; // Naranja
  if (magnitud >= 5) return "#ffff00"; // Amarillo
  return "#3388ff"; // Azul
}

// Función para calcular la distancia entre dos puntos geográficos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS = 6371; // Radio de la Tierra en km
  
  const latDistance = toRadians(lat2 - lat1);
  const lonDistance = toRadians(lon2 - lon1);
  
  const a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
         + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
         * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
         
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS * c; // Distancia en km
}

// Función para convertir grados a radianes
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

export default SismoPropagation;