import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import axios from "axios";
import SismoPropagation from "./SismoPropagation"; // Importar el componente de propagación
import API_URL from "../config";

// Solucionar el problema del icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const SismosMap = () => {
    const [sismos, setSismos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSismo, setSelectedSismo] = useState(null);
    const [viewMode, setViewMode] = useState('map'); // 'map' o 'propagation'
    
    useEffect(() => {
        axios.get(`${API_URL}/api/sismos/magnitud/5`) // Filtrar sismos con magnitud > 5
            .then(response => {
                setSismos(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener sismos:", error);
                setLoading(false);
            });
    }, []);
    
    // Función para determinar el color según la magnitud
    const getColor = (magnitud) => {
        if (!magnitud) return "#3388ff"; // Azul para No calculable
        
        if (magnitud >= 7) return "#ff0000"; // Rojo
        if (magnitud >= 6) return "#ff8800"; // Naranja
        if (magnitud >= 5) return "#ffff00"; // Amarillo
        return "#3388ff"; // Azul
    };
    
    // Manejar la selección de un sismo
    const handleSismoClick = (sismo) => {
        setSelectedSismo(sismo);
        setViewMode('propagation'); // Cambiar automáticamente a vista de propagación
    };
    
    if (loading) {
        return <div style={{ padding: "20px" }}>Cargando datos de sismos...</div>;
    }
    
    return (
        <div style={{ padding: "20px" }}>
            <h2>Visualización de Sismos</h2>
            
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                    <button 
                        style={{ 
                            padding: "8px 16px", 
                            backgroundColor: viewMode === 'map' ? "#4285f4" : "#f0f0f0",
                            color: viewMode === 'map' ? "white" : "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }} 
                        onClick={() => setViewMode('map')}
                    >
                        Mapa de Sismos
                    </button>
                    <button 
                        style={{ 
                            padding: "8px 16px", 
                            backgroundColor: viewMode === 'propagation' ? "#4285f4" : "#f0f0f0",
                            color: viewMode === 'propagation' ? "white" : "black",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }} 
                        onClick={() => setViewMode('propagation')}
                        disabled={!selectedSismo}
                    >
                        Propagación de Ondas
                    </button>
                </div>
                
                {viewMode === 'map' && (
                    <>
                        <p>Total de sismos mostrados: {sismos.length}</p>
                        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ff0000" }}></div>
                                <span>Magnitud ≥ 7</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ff8800" }}></div>
                                <span>Magnitud 6-6.9</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ffff00" }}></div>
                                <span>Magnitud 5-5.9</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {viewMode === 'map' ? (
                // Vista del mapa de sismos
                <MapContainer 
                    center={[23.6345, -102.5528]} 
                    zoom={5} 
                    style={{ height: "600px", width: "100%" }}
                >
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {sismos.map((sismo, index) => (
                        <CircleMarker
                            key={index}
                            center={[sismo.latitud, sismo.longitud]}
                            pathOptions={{ 
                                fillColor: getColor(sismo.magnitud),
                                color: "#fff",
                                weight: 1,
                                fillOpacity: 0.8
                            }}
                            radius={sismo.magnitud ? Math.min(sismo.magnitud * 2, 12) : 6}
                            eventHandlers={{
                                click: () => handleSismoClick(sismo)
                            }}
                        >
                            <Popup>
                                <div>
                                    <h3 style={{ margin: "0 0 8px 0" }}>Sismo {sismo.magnitud || "No calculable"}</h3>
                                    <p style={{ margin: "5px 0" }}><strong>Fecha:</strong> {sismo.fecha}</p>
                                    <p style={{ margin: "5px 0" }}><strong>Hora:</strong> {sismo.hora}</p>
                                    <p style={{ margin: "5px 0" }}><strong>Profundidad:</strong> {sismo.profundidad} km</p>
                                    <p style={{ margin: "5px 0" }}><strong>Ubicación:</strong> {sismo.referenciaLocalizacion}</p>
                                    <p style={{ margin: "5px 0" }}><strong>Coordenadas:</strong> {sismo.latitud}, {sismo.longitud}</p>
                                    <button 
                                        onClick={() => handleSismoClick(sismo)} 
                                        style={{ 
                                            padding: "5px 10px", 
                                            backgroundColor: "#4285f4", 
                                            color: "white", 
                                            border: "none", 
                                            borderRadius: "4px", 
                                            cursor: "pointer",
                                            marginTop: "8px"
                                        }}
                                    >
                                        Ver Propagación de Ondas
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            ) : (
                // Vista de propagación de ondas
                <SismoPropagation sismo={selectedSismo} />
            )}
            
            {viewMode === 'propagation' && (
                <div style={{ marginTop: "15px" }}>
                    <button 
                        onClick={() => setViewMode('map')} 
                        style={{ 
                            padding: "8px 16px", 
                            backgroundColor: "#f0f0f0", 
                            border: "none", 
                            borderRadius: "4px", 
                            cursor: "pointer" 
                        }}
                    >
                        Volver al Mapa
                    </button>
                </div>
            )}
        </div>
    );
};

export default SismosMap;