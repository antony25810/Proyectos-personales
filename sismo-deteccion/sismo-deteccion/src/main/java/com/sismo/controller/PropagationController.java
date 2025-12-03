package com.sismo.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sismo.model.ondasSismicas.*;
import com.sismo.service.PropagationService;

@RestController
@RequestMapping("/api/propagation")
//@CrossOrigin(origins = "http://localhost")
public class PropagationController {
    
    private final PropagationService propagationService;
    
    public PropagationController(PropagationService propagationService) {
        this.propagationService = propagationService;
    }
    
    /**
     * Calcula la propagación de ondas sísmicas
     */
    @PostMapping("/calculate")
    public PropagationResponse calculatePropagation(@RequestBody PropagationRequest request) {
        PropagationResponse response = propagationService.calculatePropagation(request);
        
        // Asegurar que la respuesta siempre tiene la estructura correcta
        if (response == null) {
            response = new PropagationResponse();
        }
        
        if (response.getTimeSteps() == null) {
            response.setTimeSteps(new ArrayList<>());
        }
        
        // Si no hay pasos de tiempo, crear algunos por defecto
        if (response.getTimeSteps().isEmpty()) {
            for (int time = 0; time <= request.getDurationSeconds(); time += request.getIntervalSeconds()) {
                WavePropagation step = new WavePropagation();
                step.setTimeSeconds(time);
                step.setPWaveRadiusKm(6.0 * time);
                step.setSWaveRadiusKm(3.5 * time);
                step.setSurfaceWaveRadiusKm(2.5 * time);
                response.getTimeSteps().add(step);
            }
        }
        
        return response;
    }
    
    /**
     * Genera estaciones virtuales alrededor de un epicentro
     */
    @GetMapping("/stations")
    public List<StationInfo> generateStations(
            @RequestParam double latitude, 
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") int numStations) {
        return propagationService.generateVirtualStations(latitude, longitude, numStations);
    }
    
    /**
     * Calcula tiempos de llegada entre epicentro y estación
     */
    @GetMapping("/arrival-times")
    public Map<String, Double> calculateArrivalTimes(
            @RequestParam("eqLat") double earthquakeLat,
            @RequestParam("eqLon") double earthquakeLon,
            @RequestParam("stationLat") double stationLat,
            @RequestParam("stationLon") double stationLon) {
        
        return propagationService.calculateArrivalTimes(
                earthquakeLat, earthquakeLon, stationLat, stationLon);
    }
    
    /**
     * Calcula la distancia entre dos puntos
     */
    @GetMapping("/distance")
    public double calculateDistance(
            @RequestParam double lat1,
            @RequestParam double lon1,
            @RequestParam double lat2,
            @RequestParam double lon2) {
        return propagationService.calculateDistance(lat1, lon1, lat2, lon2);
    }
}