package com.sismo.service;

import java.util.*;
import org.springframework.stereotype.Service;

import com.sismo.model.ondasSismicas.*;
import com.sismo.model.Sismo;
import com.sismo.repository.SismoRepository;

@Service
public class PropagationService {
    
    private final SismoRepository sismoRepository;
    
    // Velocidades típicas de ondas sísmicas (valores aproximados en km/s)
    private static final double P_WAVE_VELOCITY = 6.0;  // Ondas primarias (compresión)
    private static final double S_WAVE_VELOCITY = 3.5;  // Ondas secundarias (cizalla)
    private static final double SURFACE_WAVE_VELOCITY = 2.5;  // Ondas superficiales
    
    public PropagationService(SismoRepository sismoRepository) {
        this.sismoRepository = sismoRepository;
    }
    
    /**
     * Calcula la propagación de ondas sísmicas para un sismo específico
     */
    public PropagationResponse calculatePropagation(PropagationRequest request) {
        PropagationResponse response = new PropagationResponse();
        List<WavePropagation> timeSteps = new ArrayList<>();
        
        // Si se proporciona ID de sismo, buscar en la base de datos
        Sismo sismo = null;
        if (request.getSismoId() != null) {
            sismo = sismoRepository.findById(request.getSismoId()).orElse(null);
        }
        
        // Si no se encontró el sismo o no se proporcionó ID, usar los valores de la solicitud
        if (sismo == null) {
            sismo = new Sismo();
            sismo.setLatitud(request.getLatitud());
            sismo.setLongitud(request.getLongitud());
            sismo.setMagnitud(request.getMagnitud());
            sismo.setProfundidad(request.getProfundidad());
        }
        
        // Para cada paso de tiempo, calcula la propagación de ondas
        for (int time = 0; time <= request.getDurationSeconds(); time += request.getIntervalSeconds()) {
            WavePropagation step = new WavePropagation();
            step.setTimeSeconds(time);
            
            // Calcular radios de propagación para cada tipo de onda
            step.setPWaveRadiusKm(P_WAVE_VELOCITY * time);
            step.setSWaveRadiusKm(S_WAVE_VELOCITY * time);
            step.setSurfaceWaveRadiusKm(SURFACE_WAVE_VELOCITY * time);
            
            timeSteps.add(step);
        }
        
        response.setSismo(sismo);
        response.setTimeSteps(timeSteps);
        
        return response;
    }
    
    /**
     * Genera estaciones sísmicas virtuales alrededor de un epicentro
     */
    public List<StationInfo> generateVirtualStations(double latitud, double longitud, int numStations) {
        List<StationInfo> stations = new ArrayList<>();
        
        for (int i = 0; i < numStations; i++) {
            // Generar posiciones aleatorias en un radio de 500km
            double angle = Math.random() * Math.PI * 2;
            double distance = 100 + Math.random() * 400; // Entre 100 y 500km
            double latOffset = (distance / 111) * Math.cos(angle);
            double lonOffset = (distance / (111 * Math.cos(Math.PI * latitud / 180))) * Math.sin(angle);
            
            StationInfo station = new StationInfo();
            station.setId(i + 1);
            station.setName("Estación " + (i + 1));
            station.setLatitude(latitud + latOffset);
            station.setLongitude(longitud + lonOffset);
            
            // Calcular tiempos de llegada a esta estación
            Map<String, Double> arrivalTimes = calculateArrivalTimes(latitud, longitud, station.getLatitude(), station.getLongitude());
            station.setArrivalTimes(arrivalTimes);
            
            stations.add(station);
        }
        
        return stations;
    }
    
    /**
     * Calcula el tiempo de llegada de las ondas a un punto específico
     */
    public Map<String, Double> calculateArrivalTimes(double earthquakeLat, double earthquakeLon, 
                                                    double stationLat, double stationLon) {
        // Calcula distancia entre el epicentro y la estación
        double distance = calculateDistance(earthquakeLat, earthquakeLon, stationLat, stationLon);
        
        Map<String, Double> arrivalTimes = new HashMap<>();
        arrivalTimes.put("pWave", distance / P_WAVE_VELOCITY);
        arrivalTimes.put("sWave", distance / S_WAVE_VELOCITY);
        arrivalTimes.put("surfaceWave", distance / SURFACE_WAVE_VELOCITY);
        
        return arrivalTimes;
    }
    
    /**
     * Calcula la distancia entre dos puntos geográficos
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // Radio de la Tierra en km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS * c; // Distancia en km
    }
}