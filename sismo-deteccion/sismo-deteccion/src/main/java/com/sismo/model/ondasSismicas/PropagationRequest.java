package com.sismo.model.ondasSismicas;

import lombok.Data;

@Data
public class PropagationRequest {
    private Long sismoId;
    private double latitud;
    private double longitud;
    private Double magnitud;
    private double profundidad;
    private int durationSeconds;
    private int intervalSeconds;
}