package com.sismo.model.ondasSismicas;

import lombok.Data;

@Data
public class WavePropagation {
    private double pWaveRadiusKm;
    private double sWaveRadiusKm;
    private double surfaceWaveRadiusKm;
    private int timeSeconds;
}